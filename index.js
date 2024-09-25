document.addEventListener('DOMContentLoaded', function () {
    const internationalSelector = document.getElementById('international');
    const unitedStatesSelector = document.getElementById('unitedstates');
    const distributorList = document.getElementById('distributor-list');

    fetchCountriesStates('International', internationalSelector);
    fetchCountriesStates('USA', unitedStatesSelector);

    internationalSelector.addEventListener('change', function() {
        if (this.value) fetchDistributors('International', this.value);
    });

    unitedStatesSelector.addEventListener('change', function() {
        if (this.value) fetchDistributors('USA', this.value);
    });

    function fetchCountriesStates(region, dropdown) {
        const data = { action: 'get_countries_states', region: region };

        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(countriesOrStates => {
            countriesOrStates.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                dropdown.appendChild(option);
            });
        });
    }

    function fetchDistributors(region, countryOrState) {
       const data = {
            action: 'get_distributors',
            region: region,
            countryOrState: countryOrState
        };
        
        let resultsContainer = document.getElementById('majibu');

        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(data)
        })
        .then(response => response.json())
        .then(distributors => {
            distributorList.innerHTML = ''; // Clear previous results
            if (distributors.length > 0) {
                resultsContainer.removeAttribute("hidden");
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
                resultsContainer.removeAttribute("hidden");
            }
        });
    }
});
