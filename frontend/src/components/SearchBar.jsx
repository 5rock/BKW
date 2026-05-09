import { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search gold, tech, and more...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <span className="material-symbols-outlined absolute left-4 text-gray-400">search</span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-20 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-container dark:text-white dark:placeholder-gray-400"
      />
      <button
        type="submit"
        className="absolute right-2 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-container transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
