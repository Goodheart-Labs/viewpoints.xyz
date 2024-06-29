const KeyboardShortcutsLegend = () => (
  <div className="fixed flex-col hidden w-full px-3 py-2 mt-10 bg-white rounded-md bottom-4 bg-opacity-80 sm:flex left-4 right-4">
    <h5 className="my-1 text-xs font-semibold text-gray-600 text-gray-400">
      Keyboard Shortcuts
    </h5>
    <div>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">&rarr;</span> Agree
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">&larr;</span> Disagree
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">&uarr;</span> Skip
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">&darr;</span> It&apos;s Complicated
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">C</span> New Statement
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">E</span> Edit Statement
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">F</span> Flag Statement
      </kbd>
      <kbd className="inline-flex items-center px-1 ml-1 font-sans text-xs text-gray-400 border border-gray-200 rounded">
        <span className="mr-1 text-gray-500">L</span> Login
      </kbd>
    </div>
  </div>
);

export default KeyboardShortcutsLegend;
