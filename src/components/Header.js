export function Header() {
  const template = `
    <header>
      <nav class="w-full items-center justify-center px-2 shadow-sm bg-black">
        <div class="container mx-auto relative h-48 lg:h-24 flex flex-col items-center lg:flex-row xl:gap-16 2xl:justify-around">
          ${Logo()}
          ${SearchBar()}
          ${ActionButtons()}
        </div>
      </nav>
    </header>
  `;

  return template;
}

function Logo() {
  return `
    <a href="/" class="flex items-center">
      <img src="/logo.svg" alt="Logo" 
        class="h-24 lg:h-20 transition-transform duration-200 hover:scale-105">
    </a>
  `;
}

function SearchBar() {
  return `
    <div class="w-full md:flex-1 md:max-w-xl 2xl:max-w-2xl">
      <div class="relative">
        <input type="text" id="search-input"
          class="w-full lg:w-[80%] lg:mr-8 xl:w-[100%] p-2 md:p-4 pl-4 pr-10 bg-gray-100 rounded-lg dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Search posts...">
        <i class="absolute text-gray-400 -translate-y-1/2 fas fa-search right-3 lg:right-28 xl:right-6 top-1/2"></i>
      </div>
    </div>
  `;
}

function ActionButtons() {
  return `
    <div class="flex items-center justify-center w-full lg:w-auto">
      <button id="createBlogBtn" 
        class="create-blog-btn blog-button-trigger absolute lg:relative flex items-center justify-center text-xl md:text-4xl lg:text-2xl text-center -translate-x-1/2 translate-y-1/2 lg:-translate-y-[10%] md:top-32 md:mt-2 top-36 left-1/2 lg:left-12 lg:top-auto py-2 px-4 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 cursor-pointer">
        Create Blog
      </button>
      ${DarkModeToggle()}
    </div>
  `;
}

function DarkModeToggle() {
  return `
    <button id="darkModeToggle"
      class="absolute lg:relative lg:ml-4 sm:top-6 right-6 lg:top-auto lg:left-auto w-12 h-12 transition-colors duration-200 rounded-full text-white hover:bg-zinc-700"
      aria-label="Toggle dark mode">
      <i id="mode-icon" class="text-2xl fas fa-moon dark:text-white"></i>
    </button>
  `;
}
