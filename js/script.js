document.addEventListener('DOMContentLoaded', function () {
    const internationalSelector = document.getElementById('international');
    const unitedStatesSelector = document.getElementById('unitedstates');
    const distributorList = document.getElementById('distributor-list');
    const resultsContainer = document.getElementById('majibu');

    // Fetch and populate the countries and states on page load
    fetchCountriesStates('International', internationalSelector);
    fetchCountriesStates('USA', unitedStatesSelector);

    // Event listener for the International selector
    internationalSelector.addEventListener('change', function() {
        if (this.value) {
            // Reset US dropdown when International is selected
            unitedStatesSelector.selectedIndex = 0;
            fetchDistributors('International', this.value);
        }
    });

    // Event listener for the United States selector
    unitedStatesSelector.addEventListener('change', function() {
        if (this.value) {
            // Reset International dropdown when US is selected
            internationalSelector.selectedIndex = 0;
            fetchDistributors('USA', this.value);
        }
    });

    // Function to fetch countries or states and populate the respective dropdown
    function fetchCountriesStates(region, dropdown) {
        const data = { action: 'get_countries_states', region: region };

        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(countriesOrStates => {
            dropdown.innerHTML = `<option value="" selected>Select a ${region === 'USA' ? 'State' : 'Country'}</option>`; // Default option
            countriesOrStates.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                dropdown.appendChild(option);
            });
        });
    }

    // Function to fetch distributors based on the selected country or state
    function fetchDistributors(region, countryOrState) {
        const data = {
            action: 'get_distributors',
            region: region,
            countryOrState: countryOrState
        };

        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(distributors => {
            distributorList.innerHTML = ''; // Clear previous results
            if (distributors.length > 0) {
                resultsContainer.removeAttribute('hidden');
                distributorList.classList.add('distributor-grid'); // Add grid class
                distributors.forEach(distributor => {
                    distributorList.innerHTML += `
                        <div class="distributor-item">
                            <strong>${distributor.name}</strong><br/>
                            ${distributor.address}<br/>
                            Phone: ${distributor.phone}<br/>
                            Email: <a href="mailto:${distributor.email}">${distributor.email}</a><br/>
                            Website: <a href="${distributor.website.startsWith('http') ? distributor.website : 'http://' + distributor.website}" target="_blank">${distributor.website}</a>
                        </div>
                    `;
                });
            } else {
                distributorList.innerHTML = '<p>No distributors found.</p>';
                resultsContainer.removeAttribute('hidden');
            }
        });
    }
});
