    import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

    
    const timeInput = document.querySelector('#time');
    const timeLabel = document.querySelector('#timeLabel');
    const submit = document.querySelector('#submit');
    const resultDisplay = document.querySelector('#result');
    const inputGender = document.querySelector('#gender')
    const logBtn = document.querySelector('#logBtn');
    const logArea = document.querySelector('#logArea');
    const summaryArea = document.querySelector('#summaryArea');
    const graph = document.querySelector('#graph');

    // Initialize graph 

  const width = 400;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 20, left: 50 };
  const baseline = 110;

  const glucoseArray = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    finalScore: baseline
  }));




  const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
    
  const xScale = d3.scaleLinear()
    .domain([0,24])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain([50, 250]);
    
  const lineGenerator = d3.line()
    .x(d => xScale(d.hour))
    .y(d => yScale(d.finalScore))
    .curve(d3.curveMonotoneX);

  const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  
  const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));
  
  const path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  renderGraph();
  
    

    // Nutrient weights
    const weights = {
        hour: 0.280645,
        HbA1c: 0.118344,
        total_carb: 0.112520,
        sugar: 0.110247,
        calories: 0.099352,
        protein: 0.090501,
        total_fat: 0.078747,
        dietary_fiber: 0.061027,
        gender: 0.048618,
    };

    const logData = [];

    let numDays = 1;

    let numWarnings = 0;

    // Update label when slider moves
    timeInput.addEventListener('input', () => {
      timeLabel.textContent = timeInput.value;
    });

    // Calculate score on submit
    submit.addEventListener('click', () => {
      const dish = document.querySelector('#dish').value || 'No dish named';
      const calories = parseFloat(document.querySelector('#calories').value) || 0;
      const carbs = parseFloat(document.querySelector('#carbs').value) || 0;
      const dietary_fiber = parseFloat(document.querySelector('#fiber').value) || 0;
      const sugar = parseFloat(document.querySelector('#sugar').value) || 0;
      const total_fat = parseFloat(document.querySelector('#fat').value) || 0;
      const protein = parseFloat(document.querySelector('#protein').value) || 0;
      const Hb1Ac = parseFloat(document.querySelector('#Hb1Ac').value) || 0;
      const hour = parseInt(timeInput.value) || 12;
      const gender = parseInt(inputGender.value) || 0;

      const nutrientScore =
        calories * weights.calories +
        carbs * weights.total_carb +
        sugar * weights.sugar +
        protein * weights.protein +
        Hb1Ac * weights.HbA1c +
        hour * weights.hour +
        dietary_fiber * weights.dietary_fiber +
        total_fat * weights.total_fat;

      const finalScore = 110 + nutrientScore + gender * weights.gender;

      resultDisplay.textContent =
        `Expected Glucose Level: ${finalScore}`;
        
      updateCharacter(finalScore);  

      const timeInHours = (numDays - 1) * 24 + hour;
        
      logData.push({
        day: numDays,
        dish,
        hour,
        calories,
        carbs,
        sugar,
        protein,
        timeInHours,
        finalScore
      });

      // Update glucoseArray

      for (let i = 0; i < glucoseArray.length; i++) {
        glucoseArray[i].finalScore = baseline;
      }

      if (hour + 1 < glucoseArray.length) {
        glucoseArray[hour + 1].finalScore = finalScore;
      }

      if (hour + 2 < glucoseArray.length) {
        glucoseArray[hour + 2].finalScore = baseline;
      }
      

      updateLog();
      showSummary();
      numDays++;
      renderGraph();
      graph.style.display = 'block';
    });

    console.log(logData);

    let logVisible = false;

    logBtn.addEventListener('click', () => {
      logVisible = !logVisible;
      logArea.style.display = logVisible ? 'block' : 'none';
    });

    function updateLog() {
      const entries = logData.map(entry => {
        const warning = entry.finalScore > 180
          ? `<br><span class="danger">Dangerous glucose spike occurred!</span>`
          : '';

        if (warning) {
          numWarnings = numWarnings + 1;
        }

        return `
          <div class="log-entry">
            <strong>Day${entry.day}:</strong><br><br>
            <strong>Dish:</strong> ${entry.dish}<br>
            <strong>Time:</strong> ${entry.hour}:00<br>
            <strong>Calories:</strong> ${entry.calories}<br>
            <strong>Carbs:</strong> ${entry.carbs}g<br>
            <strong>Sugar:</strong> ${entry.sugar}g<br>
            <strong>Protein:</strong> ${entry.protein}g<br>
            <strong>Glucose Level:</strong> ${entry.finalScore}
            ${warning}
            <br><br>
          </div>`;
      }).join('');

      logArea.innerHTML = `<h3>Meal Log</h3>${entries}`;

      if (logVisible) {
        logArea.style.display = 'block';
      }
    }

    function showSummary() {
      if (numDays % 7 !== 0) return;

      const block = Math.floor((numDays - 1) / 7) + 1;
      const startDay = (block - 1) * 7 + 1;
      const endDay = block * 7;

      const blockEntries = logData.filter(entry => entry.day >= startDay && entry.day <= endDay);

      const total = {
        calories: 0,
        carbs: 0,
        sugar: 0,
        protein: 0,
        dangerousSpikes: 0
      };

      blockEntries.forEach(entry => {
        total.calories += entry.calories;
        total.carbs += entry.carbs;
        total.sugar += entry.sugar;
        total.protein += entry.protein;
        if (entry.finalScore > 180) total.dangerousSpikes++;
      });

      const avg = {
        calories: (total.calories / 7).toFixed(2),
        carbs: (total.carbs / 7).toFixed(2),
        sugar: (total.sugar / 7).toFixed(2),
        protein: (total.protein / 7).toFixed(2)
      };

      summaryArea.insertAdjacentHTML('beforeend', `
        <div class="summary">
          <h3>Days ${startDay} to ${endDay} Summary</h3>
          <strong>Total Nutrients Consumed:</strong><br>
          Calories: ${total.calories}<br>
          Carbs: ${total.carbs}g<br>
          Sugar: ${total.sugar}g<br>
          Protein: ${total.protein}g<br><br>

          <strong>Average Nutrients per Day:</strong><br>
          Calories: ${avg.calories}<br>
          Carbs: ${avg.carbs}g<br>
          Sugar: ${avg.sugar}g<br>
          Protein: ${avg.protein}g<br><br>

          <strong>Dangerous Glucose Spikes:</strong> ${total.dangerousSpikes}
        </div>
      `);
    }

    let summaryVisible = false;

    summaryBtn.addEventListener('click', () => {
      summaryVisible = !summaryVisible;
      summaryArea.style.display = summaryVisible ? 'block' : 'none';
    });
    function updateCharacter(glucoseLevel) {
      console.log('updateCharacter called with:', glucoseLevel);
      const character = document.querySelector('#character');
      if (glucoseLevel > 180) {
        character.textContent = '😢';
      } else if (glucoseLevel < 120) {
        character.textContent = '😊';
      } else {
        character.textContent = '😐';
      }
    }

    function renderGraph() {
      yScale.domain([50, d3.max(glucoseArray, d => d.finalScore) + 20]);
      yAxis.call(d3.axisLeft(yScale));
      path.datum(glucoseArray).attr("d", lineGenerator);
      path.datum(glucoseArray).transition().duration(500).attr("d", lineGenerator);
    
    }
    



    
