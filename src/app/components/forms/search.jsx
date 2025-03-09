import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className='search'>
      <input
        type='text'
        className='search'
        value={searchQuery}
        placeholder='Search books...'
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <i className='fa-solid fa-magnifying-glass'></i>
    </div>
  );
};

export default SearchBar;