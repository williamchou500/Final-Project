    const timeInput = document.querySelector('#time');
    const timeLabel = document.querySelector('#timeLabel');
    const submit = document.querySelector('#submit');
    const resultDisplay = document.querySelector('#result');
    const inputGender = document.querySelector('#gender')
    const logBtn = document.querySelector('#logBtn');
    const logArea = document.querySelector('#logArea');
    const summaryArea = document.querySelector('#summaryArea');

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
      const pacman = document.querySelector('#pacman');
      pacman.classList.remove('eat-animation');
      void pacman.offsetWidth;
      pacman.classList.add('eat-animation');

      logData.push({
        day: numDays,
        dish,
        hour,
        calories,
        carbs,
        sugar,
        protein,
        finalScore
      });

      updateLog();
      showSummary();
      numDays++;
    });

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
    function updateCharacter(glucoseLevel, calories) {
      const pacman = document.querySelector('#pacman circle');
      let color;
      if (glucoseLevel < 120) {
        color = 'green';
      } else if (glucoseLevel < 180) {
        color = 'yellow';
      } else {
        color = 'red';
      }
      pacman.setAttribute('fill', color);
      const plateFill = document.querySelector('#plate-fill');
      const maxCalories = 800;
      const fillPercent = Math.min(calories / maxCalories, 1);
      const dashArray = 2 * Math.PI * 25;
      const dashOffset = dashArray * (1 - fillPercent);
      plateFill.setAttribute('stroke-dasharray', dashArray);
      plateFill.setAttribute('stroke-dashoffset', dashOffset);
      plateFill.setAttribute('fill', fillPercent > 0 ? 'lightgreen' : 'none');
    }
    
