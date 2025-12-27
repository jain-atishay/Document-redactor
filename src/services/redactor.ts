interface RedactionResult {
    emailCount: number;
    phoneCount: number;
    ssnCount: number;
    total: number;
    trackChangesEnabled: boolean;
    headerAdded: boolean;
  }
  
  export class DocumentRedactor {
    
    async redact(): Promise<RedactionResult> {
      // Word.run creates a context for interacting with Word
      return await Word.run(async (context) => {
        const result: RedactionResult = {
          emailCount: 0,
          phoneCount: 0,
          ssnCount: 0,
          total: 0,
          trackChangesEnabled: false,
          headerAdded: false
        };
  
        // First, check if document has already been redacted
        const body = context.document.body;
        body.load('text');
        await context.sync();
        
        // Check for redaction markers
        const alreadyRedacted = body.text.includes('[EMAIL REDACTED]') || 
                                body.text.includes('[PHONE REDACTED]') || 
                                body.text.includes('[SSN REDACTED]');
        
        // Check for confidential header
        const hasConfidentialHeader = body.text.includes('CONFIDENTIAL DOCUMENT');
        
        if (alreadyRedacted && hasConfidentialHeader) {
          throw new Error('Document has already been redacted. No sensitive information found to redact.');
        }
  
        // CRITICAL: Enable track changes FIRST
        // This ensures all our changes are tracked
        result.trackChangesEnabled = await this.enableTracking(context);
  
        // Add the confidential header (will be tracked) - only if not already present
        if (!hasConfidentialHeader) {
          result.headerAdded = await this.addHeader(context);
        } else {
          result.headerAdded = true; // Already has header
        }
  
        // Reload body text after header addition
        body.load('text');
        await context.sync();
  
        // Now redact the sensitive information
        // Find and redact emails
        result.emailCount = await this.redactEmails(context, body);
        
        // Find and redact phone numbers
        result.phoneCount = await this.redactPhones(context, body);
        
        // Find and redact SSNs
        result.ssnCount = await this.redactSSNs(context, body);
  
        result.total = result.emailCount + result.phoneCount + result.ssnCount;
        
        // If nothing was found to redact
        if (result.total === 0) {
          throw new Error('No sensitive information found to redact.');
        }
  
        return result;
      });
    }
  
    private async enableTracking(context: Word.RequestContext): Promise<boolean> {
      try {
        // Check if Word supports Track Changes (API 1.5+)
        // This is a REQUIREMENT from the challenge
        if (Office.context.requirements.isSetSupported('WordApi', '1.5')) {
          // Enable Track Changes - all subsequent changes will be tracked
          context.document.changeTrackingMode = Word.ChangeTrackingMode.trackAll;
          await context.sync();
          
          // Verify it's actually enabled
          context.document.load('changeTrackingMode');
          await context.sync();
          
          return context.document.changeTrackingMode === Word.ChangeTrackingMode.trackAll;
        } else {
          console.warn('Track Changes not supported. Requires Word API 1.5 or higher.');
          return false;
        }
      } catch (error) {
        console.error('Could not enable tracking:', error);
        return false;
      }
    }
  
    private async addHeader(context: Word.RequestContext): Promise<boolean> {
      try {
        // Try to get the first section
        const section = context.document.sections.getFirst();
        await context.sync();
        
        // Try to get the header - use 'primary' type
        const header = section.getHeader('Primary');
        await context.sync();
        
        // Insert paragraph with text
        const paragraph = header.insertParagraph('CONFIDENTIAL DOCUMENT', 'Start');
        
        // Apply formatting
        paragraph.font.bold = true;
        paragraph.font.size = 16;
        paragraph.font.color = '#DC2626';
        paragraph.alignment = 'Centered';
        
        await context.sync();
        
        return true;
        
      } catch (error: any) {
        console.error('Header API not available, using fallback method');
        
        // Fallback: add to beginning of document body
        try {
          const body = context.document.body;
          const para = body.insertParagraph('CONFIDENTIAL DOCUMENT', 'Start');
          para.font.bold = true;
          para.font.size = 16;
          para.font.color = '#DC2626';
          para.alignment = 'Centered';
          
          // Add a line break after
          body.insertBreak('Line', 'End');
          
          await context.sync();
          return true;
        } catch (fallbackError) {
          console.error('Could not add header:', fallbackError);
          return false;
        }
      }
    }
  
    private async redactEmails(context: Word.RequestContext, body: Word.Body): Promise<number> {
      // RFC 5322 compliant email regex
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi;
      return await this.findAndReplace(context, body, emailPattern, '[EMAIL REDACTED]');
    }
  
    private async redactPhones(context: Word.RequestContext, body: Word.Body): Promise<number> {
      // Matches various phone formats: (555) 123-4567, 555-123-4567, +1-555-123-4567, etc.
      const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      return await this.findAndReplace(context, body, phonePattern, '[PHONE REDACTED]');
    }
  
    private async redactSSNs(context: Word.RequestContext, body: Word.Body): Promise<number> {
      // Matches SSN format: XXX-XX-XXXX
      const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
      return await this.findAndReplace(context, body, ssnPattern, '[SSN REDACTED]');
    }
  
    private async findAndReplace(
      context: Word.RequestContext,
      body: Word.Body,
      pattern: RegExp,
      replacement: string
    ): Promise<number> {
      let count = 0;
      
      try {
        // Get the text content
        body.load('text');
        await context.sync();
        
        // Find all matches in the text
        const matches = body.text.match(pattern);
        if (!matches || matches.length === 0) {
          return 0;
        }
  
        // Use Set to get unique matches (avoid replacing same pattern multiple times)
        const uniqueMatches = [...new Set(matches)];
        
        // Replace each unique match
        for (const match of uniqueMatches) {
          // Search for the pattern in the document
          const searchResults = body.search(match, { 
            matchCase: false,
            matchWholeWord: false 
          });
          
          searchResults.load('items');
          await context.sync();
  
          // Replace each occurrence
          // When Track Changes is enabled, this will show as:
          // - Strikethrough on original text (deletion tracked)
          // - Inserted text with the replacement (insertion tracked)
          for (const item of searchResults.items) {
            item.insertText(replacement, Word.InsertLocation.replace);
            count++;
          }
          
          await context.sync();
        }
  
        return count;
      } catch (error) {
        console.error('Error during find and replace:', error);
        return count;
      }
    }
  }