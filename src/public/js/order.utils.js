import help, { log, jq, doc, createTable, parseData } from './help.js';
import { _searchParty } from './module.js';
import { loadPartyDetails, updateDetails } from './order.config.js';

// Event listener for the global document to trigger search with Ctrl+Q
doc.addEventListener('keydown', function (event) {
    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
        initiateSearch();
    }
});

/**
 * Asynchronously displays a search interface to find parties.
 */
async function initiateSearch() {
    try {
        // Create the main container for the search interface
        const searchCoverContainer = jq('<div class="d-flex flex-column align-items-center gap-2 pt-5"></div>');

        // Create the form container
        const searchFormContainer = jq('<div class="d-flex flex-column bg-white gap-2 p-2 rounded position-relative" style="width: max(50%, 550px);"></div>');

        // Create the form element
        const searchForm = jq('<div class="mb-0"></div>');

        // Create the input group
        const searchInputGroup = jq('<div class="input-group"></div>');

        // Create the input field
        const searchInputField = jq('<input class="form-control form-control-lg fs-3" placeholder="Search Party" tabindex="0">');

        // Create the results container
        const searchResultsContainer = jq('<div></div>');

        // Create the close button
        const closeSearchButton = jq('<span class="input-group-text interactive-button px-4 fs-4" type="button" title="Close Search" tabindex="1"><i class="bi bi-x-lg"></i></span>')
            .on('click keypress', (e) => {
                if (e.type == 'click' || e.key == 'Enter' || e.key == ' ') {
                    jq('#event-cover').addClass('d-none').html('');
                }
            });

        // Append elements to build the structure
        searchInputGroup.append(searchInputField, closeSearchButton);
        searchForm.append(searchInputGroup);
        searchFormContainer.append(searchForm, searchResultsContainer);
        searchCoverContainer.append(searchFormContainer);
        jq('#event-cover').removeClass('d-none').html(searchCoverContainer);

        // Focus on the input field when the search interface is displayed
        searchInputField.focus();

        // Variable to track the index of the currently focused result item (-1 for input/close button)
        let focusedResultItemIndex = -1;
        let resultListItems; // Declare here to be accessible in keyup

        // Event listener for input changes to perform the search
        searchInputField.on('keyup', async function (event) {
            const searchTerm = this.value.trim(); // Get and trim the search term
            focusedResultItemIndex = -1; // Reset focus on input change

            if (searchTerm) {
                const searchResults = await _searchParty(searchTerm);

                if (searchResults.length > 0) {
                    // Create the table for displaying search results
                    const resultsTable = createTable(searchResults, true, false);
                    jq(resultsTable.table).addClass('mb-1').removeClass('table-sm');

                    // Configure the table columns
                    parseData({
                        tableObj: resultsTable,
                        colsToRight: ['party_id', 'contact'],
                        colsToShow: ['id', 'party_name', 'party_id', 'contact']
                    });

                    const tableBody = jq(resultsTable.tbody);
                    resultListItems = tableBody.find('tr').addClass('interactive-button role-btn').attr('tabindex', -1); // Initialize tabindex

                    // Event listener for clicking on a result item
                    resultListItems.on('click', function () {
                        handleResultItemSelected(searchResults, jq(this), searchInputField);
                    });

                    // Event listener for keyboard events on result items (Enter and Space)
                    resultListItems.on('keydown', function (event) {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault(); // Prevent default Spacebar behavior (scrolling)
                            handleResultItemSelected(searchResults, jq(this), searchInputField);
                        }
                    });

                    // Update the search results container
                    searchResultsContainer.html(resultsTable.table);

                    // Set tabindex for the first item to be focusable
                    if (resultListItems.length > 0) {
                        resultListItems.eq(0).attr('tabindex', 2); // Tabindex after input and close button
                    }

                } else {
                    // Clear results if no matching parties found
                    searchResultsContainer.html('');
                    focusedResultItemIndex = -1;
                }
            } else {
                // Clear results if the search term is empty
                searchResultsContainer.html('');
                focusedResultItemIndex = -1;
            }
        });

      
        /**
         * Handles the selection of a party from the search results.
         * @param {Array<Object>} dataArray - The array of search result objects.
         * @param {jQuery} selectedElement - The jQuery object of the selected table row.
         * @param {jQuery} inputElement - The jQuery object of the search input field.
         */
        function handleResultItemSelected(dataArray, selectedElement, inputElement) {
            const selectedIndex = selectedElement.index();
            const selectedParty = dataArray[selectedIndex];
            const { id, party_name, party_id, email } = selectedParty;

            // Clear the search input field
            inputElement.val('');

            // Focus on the add product input field
            jq('#addProduct').val('').focus();

            // Update the order details with the selected party information
            updateDetails({ party: id, party_name, party_id, email });

            // Load the details of the selected party
            loadPartyDetails();

            // Close the search interface
            jq('#event-cover').addClass('d-none').html('');
        }

        // Handle Tab navigation within the search interface
        searchFormContainer.on('keydown', function (event) {
            if (event.key === 'Tab') {
                event.preventDefault(); // Prevent default tab behavior

                const focusableElements = [searchInputField[0], closeSearchButton[0], ...(resultListItems ? resultListItems.toArray() : [])].filter(el => el);
                const currentFocus = document.activeElement;
                let currentIndex = focusableElements.indexOf(currentFocus);
                const itemCount = focusableElements.length;

                if (itemCount > 0) {
                    let nextIndex;
                    if (event.shiftKey) { // Shift + Tab backward
                        nextIndex = (currentIndex - 1 + itemCount) % itemCount;
                    } else { // Tab forward
                        nextIndex = (currentIndex + 1) % itemCount;
                    }

                    focusableElements[nextIndex].focus();
                }
            }
        });

    } catch (error) {
        log(error);
    }
}