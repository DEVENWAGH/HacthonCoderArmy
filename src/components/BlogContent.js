export function BlogContent() {
  const template = `
    <main class="flex-grow py-4 md:py-8 bg-gray-100 dark:bg-zinc-900">
      <div class="container mx-auto px-4">
        <div id="blogsList" class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <!-- Blogs will be displayed here -->
        </div>
      </div>
      ${CreateBlogForm()}
    </main>
  `;

  return template;
}

function CreateBlogForm() {
  return `
    <div id="createBlogFormContainer" class="fixed inset-0 z-50 hidden bg-black">
      <div class="flex flex-col min-h-screen">

        <!-- Content area with scrolling -->
        <div class="flex-grow bg-gray-100 dark:bg-zinc-900 overflow-y-auto">
          <div class="container mx-auto px-4 py-8">
            <div class="w-full lg:w-[60%] mx-auto">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
                <div class="max-w-4xl mx-auto p-6 bg-white dark:bg-black rounded-lg shadow-lg">
                  <!-- Form Header with Logo -->
                  <div class="flex items-center justify-center mb-6 form-element">
                    <img src="/logo.svg" alt="Logo" class="h-16 mb-4">
                  </div>
                  <form id="blogForm" class="space-y-6">
                    <!-- Cover Image Upload -->
                    <div class="relative group form-element">
                      <div id="coverImagePreview" class="hidden w-full h-64 bg-cover bg-center rounded-lg">
                        <button type="button" id="removeImage"
                          class="absolute top-2 right-2 z-50 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200">
                          <i class="fas fa-times text-xl"></i>
                        </button>
                      </div>
                      <div id="coverImagePlaceholder"
                        class="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 cursor-pointer group-hover:border-orange-500 group-hover:text-orange-500 transition-all duration-200">
                        <i class="fas fa-image text-4xl mb-3 transition-colors"></i>
                        <span class="transition-colors">Click or drag to add cover image</span>
                      </div>
                      <input type="file" id="coverImage" accept="image/*" class="hidden">
                      <label for="coverImage" class="absolute inset-0 cursor-pointer"></label>
                    </div>

                    <!-- Title -->
                    <div class="form-element">
                      <input type="text" id="title" name="title" required
                        placeholder="Add a bold title that captures attention..."
                        class="mt-1 block w-full px-3 py-2 text-xl bg-white dark:bg-gray-700 border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none">
                    </div>

                    <!-- Category -->
                    <div class="form-element">
                      <select id="category" required
                        class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">Select Category</option>
                        <option value="technology">Technology</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="travel">Travel</option>
                        <option value="food">Food</option>
                      </select>
                    </div>

                    <!-- Tags -->
                    <div class="form-element">
                      <div class="flex flex-wrap gap-2 mb-2" id="tagContainer"></div>
                      <input type="text" id="tagInput" placeholder="Add up to 5 tags (press Enter)"
                        class="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>

                    <!-- Rich Text Editor Toolbar -->
                    <div class="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-t-lg border border-gray-200 dark:border-gray-600 form-element">
                      <button type="button" data-format="bold" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-bold"></i>
                      </button>
                      <button type="button" data-format="italic" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-italic"></i>
                      </button>
                      <button type="button" data-format="underline" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-underline"></i>
                      </button>
                      <div class="border-r border-gray-300 dark:border-gray-500 mx-2"></div>
                      <button type="button" data-format="heading" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-heading"></i>
                      </button>
                      <button type="button" data-format="bullet" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-list-ul"></i>
                      </button>
                      <button type="button" data-format="number" class="format-btn p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200">
                        <i class="fas fa-list-ol"></i>
                      </button>
                    </div>

                    <!-- Content -->
                    <div contenteditable="true" id="content"
                      class="min-h-[200px] max-h-[400px] overflow-y-auto mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-orange-500 form-element"
                      data-placeholder="What's on your mind?">
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-between items-center form-element">
                      <button type="button" id="saveDraftBtn"
                        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                        <i class="fas fa-save"></i>
                        Save Draft
                      </button>
                      <div class="flex gap-2">
                        <button type="button" id="cancelBtn"
                          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                          <i class="fas fa-arrow-left"></i>
                          Back
                        </button>
                        <button type="submit" id="publishBtn"
                          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                          <i class="fas fa-paper-plane"></i>
                          Publish
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fixed footer at bottom -->
        <footer class="bg-white dark:bg-black py-6">
          <div class="container mx-auto px-4 text-center">
            <p class="text-gray-600 dark:text-gray-400">
              &copy; 2024 EchoBlogs. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  `;
}
