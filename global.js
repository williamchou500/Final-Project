    const timeInput = document.querySelector('#time');
    const timeLabel = document.querySelector('#timeLabel');
    const submit = document.querySelector('#submit');
    const resultDisplay = document.querySelector('#result');
    const inputGender = document.querySelector('#gender')

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

    // Update label when slider moves
    timeInput.addEventListener('input', () => {
      timeLabel.textContent = timeInput.value;
    });

    // Calculate score on submit
    submit.addEventListener('click', () => {
      const calories = parseFloat(document.querySelector('#calories').value) || 0;
      const carbs = parseFloat(document.querySelector('#carbs').value) || 0;
      const dietary_fiber = parseFloat(document.querySelector('#fiber').value) || 0;
      const sugar = parseFloat(document.querySelector('#sugar').value) || 0;
      const total_fat = parseFloat(document.querySelector('#fat').value) || 0;
      const protein = parseFloat(document.querySelector('#protein').value) || 0;
      const Hb1Ac = parseFloat(document.querySelector('#Hb1Ac').value) || 0;
      const hour = parseInt(timeInput.value);
      const gender = parseInt(inputGender.value)

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
    });