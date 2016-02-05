// Autocomplete.js
// Written By: Alexander Leishman, Feb 5 2016

var Autocomplete = (function() {
  "use strict"; 

  function Autocomplete(id, opts) {
    this.selector = id;
    this.inputBox = document.getElementById(id);
    this.inputBoxPosition = this.inputBox.getBoundingClientRect();
    this.selectedItem = null;
    this.listItems = [];
    this.displayedListItems = [];
    this.onSelect = opts.onSelect;
    this._setupDom();
    this._bindEvents();
  }

  //////////////////
  // "Public" API
  //////////////////

  /* 
   * Set elements array for autocomplete
   * @param {Array[Object]} items, array of elements in list
   * @returns {Void}
   */
  Autocomplete.prototype.setItems = function(items) {
    this.listItems = items;
  };



  //////////////////
  // "Private" API
  //////////////////

  Autocomplete.prototype._filterItems = function(input) {
    var out = [];

    for(var i=0; i < this.listItems.length; i++) {
      if(this.listItems[i].title.indexOf(input) >= 0) {
        out.push(this.listItems[i]);
      }
    }

    return out;
  };


  Autocomplete.prototype._displayItems = function(items, highlightedIndex) {
    if(items.length === 0) {
      return;
    }

    this.listWrapper.style.display = 'block';
    this.displayedListItems = items;
    this.listWrapper.innerHTML = '';

    for(var i=0; i < items.length; i++) {
      var listItem = document.createElement('li');
      listItem.innerHTML = items[i].title;
      listItem.className = 'autocomplete-listItem';
      if(i === highlightedIndex) {
        listItem.className += ' autocomplete-highlighted';
      }
      this.listWrapper.appendChild(listItem);
    }
  };

  Autocomplete.prototype._bindEvents = function() {

    // bind keyup events
    this.inputBox.onkeyup = function(e) {
      var keycode, currentHighlightedIndex;

      keycode = e.which;
      // down and up arrows
      if(keycode === 38 || keycode === 40) {
        currentHighlightedIndex = this.highlightedIndex;
        if(typeof currentHighlightedIndex !== "number" || isNaN(currentHighlightedIndex)) {
          this._highlightElement(0);
        } else if(keycode === 40) {
          this._highlightElement(this.highlightedIndex + 1);
        } else {
          this._highlightElement(this.highlightedIndex - 1);
        }
        // enter
      } else if(keycode === 13) {
        return;
        // esc keycode
      } else if(keycode === 27) {
        this._closeList();
      } else {
        this._highlightElement(null);
        var items = this._filterItems(e.target.value);
        this._displayItems(items);
      }
    }.bind(this);

    // bind keydown events
    this.inputBox.onkeydown = function(e) {
      if(e.which === 13) {
        e.preventDefault();

        if(this.highlightedIndex !== undefined || this.highlightedIndex !== null) {
          if(this.displayedListItems[this.highlightedIndex]) {
            this._selectItem(this.displayedListItems[this.highlightedIndex]);
          } else {
            this._selectItem(this.selectedItem);
          }
        } else {
          this._selectItem(this.selectedItem);
        }
        this._closeList();
      } 
    }.bind(this);

    // used http://stackoverflow.com/a/13657635/2302781 as inspiration
    function getIndexOfItem(item) {
      var indexOfItem = 0;
      while(item = item.previousSibling) {
        if(item.nodeType === 1)
          indexOfItem += 1;
      }
      return indexOfItem;
    }

    this.listWrapper.onclick = function(e) {
      var indexOfItem = getIndexOfItem(e.target);
      this._selectItem(this.displayedListItems[indexOfItem]);
      this._closeList();
    }.bind(this);

    document.onclick = function(e) {
      this._closeList();
    }.bind(this);
  };


  Autocomplete.prototype._highlightElement = function(newIndex)  {
    this.highlightedIndex = newIndex % this.displayedListItems.length;
    this._displayItems(this.displayedListItems, this.highlightedIndex);
  };


  Autocomplete.prototype._closeList = function() {
    this.highlightedItem = null;
    this.listWrapper.style.display = 'none';
    this._displayItem(this.selectedItem);
  };

  Autocomplete.prototype._displayItem = function(item) {
    if(item)
      this.inputBox.value = item.title;
  };

  Autocomplete.prototype._selectItem = function(item) {
    this.selectedItem = item;
    this._displayItem(item);
    if(this.onSelect !== undefined) {
      this.onSelect(item);
    }
  };

  Autocomplete.prototype._setupDom = function() {
    this.inputBox.setAttribute('autocomplete', 'off');
    var listWrapper = document.createElement('ul');
    listWrapper.className = 'autocomplete-dropdown';
    listWrapper.style.top = (this.inputBoxPosition.top + this.inputBox.height + 2) + 'px';
    listWrapper.style.left = this.inputBoxPosition.left + 'px';
    listWrapper.style.width = this.inputBoxPosition.width + 'px';
    listWrapper.style.display = 'none';
    this.listWrapper = listWrapper;
    this.inputBox.parentNode.insertBefore(listWrapper, this.inputBox.nextElementSibling);
  };

  return Autocomplete;
}());