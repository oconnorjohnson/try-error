# Setting Up Algolia DocSearch

The try-error documentation site has Algolia DocSearch integration ready to go! You just need to configure it with your Algolia credentials.

## Quick Setup

1. **Apply for DocSearch** (Free for open source projects)

   - Go to https://docsearch.algolia.com/apply
   - Fill out the application form
   - Wait for approval (usually takes 1-2 days)

2. **Get your credentials**
   Once approved, you'll receive:

   - Application ID
   - Search-Only API Key
   - Index Name

3. **Configure environment variables**
   Create a `.env.local` file in the `try-error-docs` directory:

   ```bash
   # Algolia DocSearch Configuration
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id_here
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_api_key_here
   NEXT_PUBLIC_ALGOLIA_INDEX_NAME=your_index_name_here
   ```

4. **Restart the development server**
   ```bash
   pnpm dev
   ```

## How It Works

- The search functionality is implemented in `/src/components/SearchDialog.tsx`
- It uses the official `@docsearch/react` component
- Keyboard shortcut: `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- The search modal will display results from your Algolia index

## Alternative: Self-Hosted Search

If you don't want to wait for DocSearch approval, you can:

1. Create your own Algolia account at https://www.algolia.com/
2. Create an index and configure it manually
3. Use the Algolia crawler or build your own indexing solution

## Current Implementation

The search is fully implemented with:

- ✅ Search button in the header
- ✅ Keyboard shortcuts (Cmd/Ctrl + K)
- ✅ Modal search interface
- ✅ Result transformation for proper URLs
- ✅ Responsive design

Just add your Algolia credentials and it will work!
