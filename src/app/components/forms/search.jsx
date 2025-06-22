const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="u1 mb-5 md:mb-0 w-full md:w-80 justify-end">
      <input
        type="text"
        value={searchQuery}
        placeholder="Search books..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <i className="fa-solid fa-magnifying-glass absolute mr-3 text-primary" />
    </div>
  );
};

export default SearchBar;