        let currentView = 'table'; // Initialize the view state
        let isAnimating = false;
        let currentYearIndex = 0; // Add this to track current position
        let animationState = {
            currentIndex: 0,
            isPlaying: false,
            yearCycle: 0 // Track how many times we've cycled through all years
        };

        function showLoading() {
            document.getElementById('loadingOverlay').classList.add('visible');
        }

        function hideLoading() {
            document.getElementById('loadingOverlay').classList.remove('visible');
        }

        function toggleView() {
            const tableDiv = document.getElementById('rankingsTable');
            const chartDiv = document.getElementById('rankingsChart');
            const toggleButton = document.getElementById('viewToggle');
            const animationControls = document.getElementById('animationControls');

            if (currentView === 'table') {
                tableDiv.style.display = 'none';
                chartDiv.style.display = 'block';
                toggleButton.innerHTML = '<i class="fas fa-table"></i> Passer au tableau';
                animationControls.style.display = 'flex';
                currentView = 'chart';
            } else {
                tableDiv.style.display = 'block';
                chartDiv.style.display = 'none';
                toggleButton.innerHTML = '<i class="fas fa-chart-bar"></i> Passer au graphique';
                animationControls.style.display = 'none';
                currentView = 'table';
            }
            updateRankings();
        }

        async function updateRankings() {
    showLoading();

    try {
        const year = parseInt(document.getElementById('yearSelect').value);
        const crimeType = document.getElementById('crimeTypeSelect').value;
        const sortOrder = document.getElementById('sortOrder').value;

        // Filtrer d'abord par année
        let filteredData = crimeData.filter(d => 
            d.Year === year && 
            d.Value !== null && 
            d.Value !== undefined && 
            !isNaN(d.Value)
        );

        // Map pour stocker les données par pays
        const countryDataMap = new Map();

        if (crimeType !== 'all') {
            // Filtrer par type de crime spécifique
            filteredData.forEach(d => {
                if (d['Crime Type'] === crimeType) {
                    countryDataMap.set(d.NAME, d);
                }
            });
        } else {
            // Calculer le total pour tous les crimes par pays
            filteredData.forEach(d => {
                const existingTotal = countryDataMap.get(d.NAME);
                if (existingTotal) {
                    existingTotal.Value += d.Value;
                } else {
                    countryDataMap.set(d.NAME, {
                        NAME: d.NAME,
                        Value: d.Value,
                        Year: year,
                        'Crime Type': 'Tous les crimes'
                    });
                }
            });
        }

        // Liste complète des pays avec leurs noms exacts
        const countryMapping = {
            "Tchéquie": ["République tchèque", "Tchéquie", "Czech Republic"],
            "Kosovo*": ["Kosovo", "Kosovo*", "Kosovo (under UNSCR 1244)"],
            "Irlande du Nord (Royaume-Uni) (NUTS 2021)": ["Irlande du Nord", "Northern Ireland", "Irlande du Nord (Royaume-Uni) (NUTS 2021)"],
            "Écosse (NUTS 2021)": ["Écosse", "Scotland", "Écosse (NUTS 2021)"]
        };

        // Convertir la Map en tableau avec gestion des noms alternatifs
        filteredData = Array.from(countryDataMap.values());

        // Ajouter les pays manquants uniquement s'ils n'ont vraiment pas de données
        const allCountries = [
            "Albanie", "Autriche", "Belgique", "Bosnie-Herzégovine", "Bulgarie", 
            "Croatie", "Chypre", "Tchéquie", "Danemark", 
            "Angleterre et Pays de Galles", "Estonie", "Finlande", "France", 
            "Allemagne", "Grèce", "Hongrie", "Islande", "Irlande", "Italie", 
            "Kosovo*", "Lettonie", "Liechtenstein", "Lituanie", "Luxembourg", 
            "Malte", "Monténégro", "Pays-Bas", "Macédoine du Nord", 
            "Irlande du Nord (Royaume-Uni) (NUTS 2021)", "Norvège", "Pologne", 
            "Portugal", "Roumanie", "Écosse (NUTS 2021)", "Serbie", "Slovaquie", 
            "Slovénie", "Espagne", "Suède", "Suisse", "Turquie"
        ];

        // Fonction pour vérifier si un pays est déjà présent (en tenant compte des noms alternatifs)
        const isCountryPresent = (countryName) => {
            // Vérifier le nom exact
            if (filteredData.some(d => d.NAME === countryName)) return true;
            
            // Vérifier les noms alternatifs
            for (const [standardName, alternatives] of Object.entries(countryMapping)) {
                if (alternatives.includes(countryName)) {
                    return filteredData.some(d => alternatives.includes(d.NAME));
                }
            }
            return false;
        };

        // Ajouter seulement les pays vraiment manquants
        allCountries.forEach(country => {
            if (!isCountryPresent(country)) {
                filteredData.push({
                    NAME: country,
                    Value: null,  // Utiliser null au lieu de 0 pour indiquer l'absence de données
                    Year: year,
                    'Crime Type': crimeType === 'all' ? 'Tous les crimes' : crimeType
                });
            }
        });

        // Normaliser les noms des pays selon le mapping
        filteredData = filteredData.map(d => {
            let normalizedName = d.NAME;
            for (const [standardName, alternatives] of Object.entries(countryMapping)) {
                if (alternatives.includes(d.NAME)) {
                    normalizedName = standardName;
                    break;
                }
            }
            return {...d, NAME: normalizedName};
        });

        // Trier les données en mettant les valeurs null à la fin
        filteredData.sort((a, b) => {
            if (a.Value === null && b.Value === null) return 0;
            if (a.Value === null) return 1;
            if (b.Value === null) return -1;
            return sortOrder === 'desc' ? b.Value - a.Value : a.Value - b.Value;
        });

        // Afficher les données selon la vue actuelle
        if (currentView === 'table') {
            displayTableView(filteredData);
        } else {
            // Pour le graphique, filtrer les valeurs null
            const chartData = filteredData.filter(d => d.Value !== null);
            displayChartView(chartData);
        }

    } catch (error) {
        console.error('Error updating rankings:', error);
        const container = currentView === 'table' ? 'rankingsTable' : 'rankingsChart';
        document.getElementById(container).innerHTML = 
            '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
            'Une erreur est survenue lors de la mise à jour des classements. Veuillez réessayer.</div>';
    } finally {
        hideLoading();
    }
}

        function displayTableView(data) {
            try {
                const tableDiv = document.getElementById('rankingsTable');
                if (!data || data.length === 0) {
                    tableDiv.innerHTML = '<div style="padding: 20px; text-align: center;">No data available for the selected criteria.</div>';
                    return;
                }

                let html = `
                    <table>
                        <thead>
                            <tr>
                                <th>Classement</th>
                                <th>Pays</th>
                                <th>Taux pour 100 000 habitants</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                let rank = 1;
                data.forEach(d => {
                    if (d && d.NAME) {
                        let rowClass = '';
                        let medalClass = '';
                        
                        if (rank === 1) {
                            rowClass = 'rank-1';
                            medalClass = 'medal-1';
                        } else if (rank === 2) {
                            rowClass = 'rank-2';
                            medalClass = 'medal-2';
                        } else if (rank === 3) {
                            rowClass = 'rank-3';
                            medalClass = 'medal-3';
                        } else if (rank <= 10) {
                            rowClass = 'rank-top-10';
                        }

                        html += `
                            <tr class="${rowClass}">
                                <td class="rank-cell ${medalClass}">#${rank}</td>
                                <td>${d.NAME}</td>
                                <td class="value-cell">${d.Value !== null ? d.Value.toFixed(2) : 'NA'}</td>
                            </tr>
                        `;
                        rank++;
                    }
                });

                html += `
                        </tbody>
                    </table>
                `;

                tableDiv.innerHTML = html;
            } catch (error) {
                console.error('Error displaying table:', error);
                document.getElementById('rankingsTable').innerHTML = 
                    '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
                    'An error occurred while displaying the data. Please try again.</div>';
            }
        }

        function displayChartView(data) {
            try {
                // Filter out invalid entries but keep all valid countries
                data = data.filter(d => 
                    d && 
                    d.NAME && 
                    d.Value !== null && 
                    d.Value !== undefined && 
                    !isNaN(d.Value)
                );

                if (data.length === 0) {
                    document.getElementById('rankingsChart').innerHTML = 
                        '<div style="padding: 20px; text-align: center;">No data available for the selected criteria.</div>';
                    return;
                }

                const trace = {
                    ...defaultBarStyle,
                    x: data.map(d => d.Value),
                    y: data.map(d => d.NAME),
                    type: 'bar',
                    orientation: 'h',
                    text: data.map(d => d.Value.toFixed(2)),
                    textposition: 'outside',
                    textfont: {
                        size: 12  // Reduced font size for better fit
                    }
                };

                const layout = {
                    ...defaultChartLayout,
                    height: Math.max(1000, data.length * 35), // Increased height per country
                    margin: { 
                        l: 250,  // Increased left margin for country names
                        r: 100,  // Increased right margin for values
                        t: 120, 
                        b: 80 
                    },
                    yaxis: {
                        ...defaultChartLayout.yaxis,
                        automargin: true,
                        tickfont: { 
                            size: 11  // Smaller font for country names
                        }
                    },
                    xaxis: {
                        ...defaultChartLayout.xaxis,
                        automargin: true
                    }
                };

                Plotly.newPlot('rankingsChart', [trace], layout, {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                    scrollZoom: true,  // Enable scroll zoom
                    showTips: true     // Show hover tips
                });
            } catch (error) {
                console.error('Error displaying chart:', error);
                document.getElementById('rankingsChart').innerHTML = 
                    '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
                    'An error occurred while displaying the chart. Please try again.</div>';
            }
        }

        async function playAnimation() {
            if (isAnimating) {
                // Pause animation
                isAnimating = false;
                animationState.isPlaying = false;
                document.getElementById('animateButton').innerHTML = '<i class="fas fa-play"></i> Lire l\'animation';
                return;
            }

            // Switch to chart view if not already there
            if (currentView !== 'chart') {
                toggleView();
            }

            isAnimating = true;
            animationState.isPlaying = true;
            document.getElementById('animateButton').innerHTML = '<i class="fas fa-stop"></i> Arrêter l\'animation';
            
            const yearSelect = document.getElementById('yearSelect');
            const years = Array.from(yearSelect.options).map(opt => parseInt(opt.value));
            const crimeType = document.getElementById('crimeTypeSelect').value;
            const sortOrder = document.getElementById('sortOrder').value;

            // If we're starting fresh or have completed a cycle, reset to current year
            if (animationState.yearCycle === 0 || currentYearIndex >= years.length) {
                currentYearIndex = years.indexOf(parseInt(yearSelect.value));
            }

            while (isAnimating) {
                for (let i = currentYearIndex; i < years.length; i++) {
                    if (!isAnimating) {
                        currentYearIndex = i; // Save position when stopping
                        break;
                    }
                    
                    const year = years[i];
                    yearSelect.value = year.toString();
                    currentYearIndex = i; // Update index as we progress
                    
                    let filteredData = crimeData.filter(d => 
                        d.Year === year && 
                        d.Value !== null && 
                        d.Value !== undefined && 
                        !isNaN(d.Value) &&
                        d.NAME
                    );

                    // Rest of the animation code remains the same
                    // ...existing code...

                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                if (isAnimating) {
                    // Only increment cycle count and reset if we completed the loop
                    animationState.yearCycle++;
                    currentYearIndex = 0;
                }
            }
        }

        // Initialize when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            // Make sure styles are loaded before updating
            if (document.readyState === 'complete') {
                updateRankings();
                // Initialize currentYearIndex based on selected year
                const yearSelect = document.getElementById('yearSelect');
                const years = Array.from(yearSelect.options).map(opt => parseInt(opt.value));
                currentYearIndex = years.indexOf(parseInt(yearSelect.value));
                animationState.yearCycle = 0;
            } else {
                window.addEventListener('load', () => {
                    updateRankings();
                    const yearSelect = document.getElementById('yearSelect');
                    const years = Array.from(yearSelect.options).map(opt => parseInt(opt.value));
                    currentYearIndex = years.indexOf(parseInt(yearSelect.value));
                    animationState.yearCycle = 0;
                });
            }
        });

        // Add year selection handler to update currentYearIndex
        document.getElementById('yearSelect').addEventListener('change', (e) => {
            const years = Array.from(e.target.options).map(opt => parseInt(opt.value));
            currentYearIndex = years.indexOf(parseInt(e.target.value));
            animationState.yearCycle = 0; // Reset cycle count when manually changing year
        });

        // Update the chart layout configuration
    const defaultChartLayout = {
        title: {
            font: { 
                size: 28,
                color: '#1e293b',
                weight: 600
            },
            y: 0.98,
            pad: { b: 20 }
        },
        xaxis: {
            title: 'Taux pour 100 000 habitants',
            tickfont: { size: 14 },
            gridcolor: '#f1f5f9',
            zerolinecolor: '#cbd5e1'
        },
        yaxis: {
            title: 'Pays',
            tickfont: { size: 14 },
            gridcolor: '#f1f5f9'
        },
        height: 800,  // Fixed height for better visibility
        margin: { l: 200, r: 50, t: 120, b: 80 },
        plot_bgcolor: '#ffffff',
        paper_bgcolor: '#ffffff',
        showlegend: false,
        transition: {
            duration: 500,
            easing: 'cubic-in-out'
        }
    };

    // Enhanced bar style configuration
    const defaultBarStyle = {
        marker: {
            color: '#3b82f6',
            opacity: 0.8,
            line: {
                color: '#2563eb',
                width: 1
            }
        },
        hoverlabel: {
            bgcolor: '#ffffff',
            bordercolor: '#3b82f6',
            font: { size: 14 }
        }
    };

    // Update the animation function
    async function playAnimation() {
        if (isAnimating) {
            isAnimating = false;
            animationState.isPlaying = false;
            document.getElementById('animateButton').innerHTML = '<i class="fas fa-play"></i> Lire l\'animation';
            return;
        }

        if (currentView !== 'chart') {
            toggleView();
        }

        isAnimating = true;
        animationState.isPlaying = true;
        document.getElementById('animateButton').innerHTML = '<i class="fas fa-stop"></i> Arrêter l\'animation';
        
        const yearSelect = document.getElementById('yearSelect');
        const years = Array.from(yearSelect.options).map(opt => parseInt(opt.value));

        while (isAnimating) {
            for (let i = currentYearIndex; i < years.length; i++) {
                if (!isAnimating) {
                    currentYearIndex = i;
                    break;
                }
                
                const year = years[i];
                yearSelect.value = year.toString();
                currentYearIndex = i;

                // Update the data for the current year
                const filteredData = await processDataForYear(year);
                
                // Update the chart with animation
                const trace = {
                    ...defaultBarStyle,
                    x: filteredData.map(d => d.Value),
                    y: filteredData.map(d => d.NAME),
                    type: 'bar',
                    orientation: 'h',
                    text: filteredData.map(d => d.Value.toFixed(2)),
                    textposition: 'outside',
                    textfont: {
                        size: 14,
                        color: '#64748b'
                    }
                };

                const layout = {
                    ...defaultChartLayout,
                    title: {
                        ...defaultChartLayout.title,
                        text: `Classement des crimes en ${year}`
                    },
                    annotations: [{
                        text: document.getElementById('crimeTypeSelect').value === 'all' ? 
                            'Tous les crimes' : document.getElementById('crimeTypeSelect').value,
                        font: { size: 16, color: '#64748b' },
                        showarrow: false,
                        x: 0.5,
                        y: 1.05,
                        xref: 'paper',
                        yref: 'paper',
                        yanchor: 'bottom'
                    }]
                };

                await Plotly.react('rankingsChart', [trace], layout, {
                    responsive: true,
                    displayModeBar: true,
                    displaylogo: false,
                    modeBarButtonsToRemove: ['lasso2d', 'select2d']
                });

                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            if (isAnimating) {
                currentYearIndex = 0;
                animationState.yearCycle++;
            }
        }
    }

    // Add helper function to process data
    async function processDataForYear(year) {
        const crimeType = document.getElementById('crimeTypeSelect').value;
        const sortOrder = document.getElementById('sortOrder').value;

        // Get all countries that should be shown
        const allCountries = [
            "Albanie", "Autriche", "Belgique", "Bosnie-Herzégovine", "Bulgarie", 
            "Croatie", "Chypre", "Tchéquie", "Danemark", 
            "Angleterre et Pays de Galles", "Estonie", "Finlande", "France", 
            "Allemagne", "Grèce", "Hongrie", "Islande", "Irlande", "Italie", 
            "Kosovo*", "Lettonie", "Liechtenstein", "Lituanie", "Luxembourg", 
            "Malte", "Monténégro", "Pays-Bas", "Macédoine du Nord", 
            "Irlande du Nord (Royaume-Uni) (NUTS 2021)", "Norvège", "Pologne", 
            "Portugal", "Roumanie", "Écosse (NUTS 2021)", "Serbie", "Slovaquie", 
            "Slovénie", "Espagne", "Suède", "Suisse", "Turquie"
        ];

        let filteredData = crimeData.filter(d => 
            d.Year === year && 
            d.Value !== null && 
            d.Value !== undefined && 
            !isNaN(d.Value)
        );

        // Create map for country data
        const countryDataMap = new Map();

        if (crimeType !== 'all') {
            // Filter by specific crime type
            filteredData.forEach(d => {
                if (d['Crime Type'] === crimeType) {
                    countryDataMap.set(d.NAME, d);
                }
            });
        } else {
            // Calculate totals for all crimes by country
            filteredData.forEach(d => {
                const existingData = countryDataMap.get(d.NAME);
                if (existingData) {
                    existingData.Value += d.Value;
                } else {
                    countryDataMap.set(d.NAME, {
                        NAME: d.NAME,
                        Value: d.Value,
                        Year: year,
                        'Crime Type': 'Tous les crimes'
                    });
                }
            });
        }

        // Ensure all countries are represented
        const resultData = allCountries.map(country => {
            const data = countryDataMap.get(country);
            return data || {
                NAME: country,
                Value: 0, // Use 0 instead of null to keep country visible
                Year: year,
                'Crime Type': crimeType === 'all' ? 'Tous les crimes' : crimeType
            };
        });

        // Sort data
        resultData.sort((a, b) => 
            sortOrder === 'desc' ? b.Value - a.Value : a.Value - b.Value
        );

        return resultData; // Return all countries instead of just top 20
    }

    // Update displayChartView to handle the full dataset better
    function displayChartView(data) {
        try {
            if (data.length === 0) {
                document.getElementById('rankingsChart').innerHTML = 
                    '<div style="padding: 20px; text-align: center;">No data available for the selected criteria.</div>';
                return;
            }

            const trace = {
                ...defaultBarStyle,
                x: data.map(d => d.Value),
                y: data.map(d => d.NAME),
                type: 'bar',
                orientation: 'h',
                text: data.map(d => d.Value.toFixed(2)),
                textposition: 'outside',
                textfont: {
                    size: 14,
                    color: '#64748b'
                }
            };

            const layout = {
                ...defaultChartLayout,
                height: Math.max(800, data.length * 25), // Adjust height based on number of countries
                margin: { l: 200, r: 50, t: 120, b: 80 },
                title: {
                    ...defaultChartLayout.title,
                    text: `Classement des crimes (${document.getElementById('yearSelect').value})`
                },
                yaxis: {
                    ...defaultChartLayout.yaxis,
                    automargin: true // Ensure country names are fully visible
                }
            };

            Plotly.newPlot('rankingsChart', [trace], layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d']
            });
        } catch (error) {
            console.error('Error displaying chart:', error);
            document.getElementById('rankingsChart').innerHTML = 
                '<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px;">' +
                'An error occurred while displaying the chart. Please try again.</div>';
        }
    }
