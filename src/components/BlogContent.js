export function BlogContent() {
  const template = `
    <main class="flex-grow py-4 md:py-8 bg-gray-100 dark:bg-zinc-900">
      <div class="container mx-auto px-4">
        <div id="content" class="space-y-4 md:space-y-8">
          <!-- Blog posts will be populated here -->
        </div>
      </div>
      ${CreateBlogForm()}
    </main>
  `;

  return template;
}

function CreateBlogForm() {
  return `
    <div id="createBlogFormContainer" class="fixed inset-0 z-50 hidden bg-black bg-opacity-50">
      <div class="container mx-auto h-screen flex items-center justify-center p-4">
        <div class="w-full xl:w-1/2 bg-white dark:bg-gray-800 rounded-lg">
          <div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <!-- Form content -->
          </div>
        </div>
      </div>
    </div>
  `;
}
