document.addEventListener('DOMContentLoaded', function () {
    const internationalSelector = document.getElementById('international');
    const unitedStatesSelector = document.getElementById('unitedstates');
    const australiaStateGroup = document.getElementById('state-group-international');
    const australiaStateSelector = document.getElementById('state-international');
    const distributorList = document.getElementById('distributor-list');
    const resultsContainer = document.getElementById('majibu');

    // Fetch and populate the countries and states on page load
    fetchCountriesStates('International', internationalSelector);
    fetchCountriesStates('USA', unitedStatesSelector);
	
	// Event listener for the International selector
	internationalSelector.addEventListener('change', function() {
        if (this.value === '') {
            clearResults(); // Clear results if default option is selected
        } else if(this.value === 'Australia'){
			unitedStatesSelector.selectedIndex = 0;
			australiaStateGroup.style.display = 'block';
            fetchCountriesStates('Australia', australiaStateSelector);
			
			australiaStateSelector.addEventListener('change', function() {
				if (this.value === '') {
					clearResults(); // Clear results if default option is selected
				}
				else if (this.value === 'International') {
					clearResults(); // Clear results if default option is selected
				} else {
					unitedStatesSelector.selectedIndex = 0;
					fetchDistributors('Australia', this.value);
				}
			});
		} else {
            unitedStatesSelector.selectedIndex = 0; // Reset US selector
			australiaStateGroup.style.display = 'none';
            fetchDistributors('International', this.value);
        }
    });
	    
	// Event listener for the United States selector
    unitedStatesSelector.addEventListener('change', function() {
        if (this.value === '') {
            clearResults(); // Clear results if default option is selected
        } else {
            internationalSelector.selectedIndex = 0; // Reset International selector
			australiaStateGroup.style.display = 'none';
            fetchDistributors('USA', this.value);
        }
    });
	
	// Function to fetch countries or states and populate the respective dropdown
    function fetchCountriesStates(region, selector) {      
		const data = { action: 'get_countries_states', region: region };
        fetch(wp_vars.ajaxurl, {
            method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(statesOrCountries => {
            statesOrCountries.forEach(value => {
				statesOrCountries.sort();
                const option = document.createElement('option');
                option.value = value;
                option.text = value;
                selector.appendChild(option);
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

        fetch(wp_vars.ajaxurl, {
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
                            PH: ${distributor.phone}<br/>
                            E: <a href="mailto:${distributor.email}">${distributor.email}</a><br/>
                            W: <a href="${distributor.website.startsWith('http') ? distributor.website : 'http://' + distributor.website}" target="_blank">${distributor.website}</a>

                        </div>
                    `;
                });
            } else {
                distributorList.innerHTML = '<p>No distributors found.</p>';
                resultsContainer.removeAttribute('hidden');
            }
        });
    }

    function clearResults() {
        distributorList.innerHTML = '';
        resultsContainer.hidden = true;
    }
});