document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Animations (fade-up)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // 2. Form Submission Handler
    const guestForm = document.getElementById('guest-form');
    const successMessage = document.getElementById('success-message');

    if (guestForm) {
        // Toggle fields based on attendance
        const attendanceRadios = guestForm.querySelectorAll('input[name="attendance"]');
        const optionalGroups = [
            document.getElementById('companions-group'),
            document.getElementById('drinks-group'),
            document.getElementById('transfer-group'),
            document.getElementById('allergies-group')
        ];

        attendanceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isComing = e.target.value === 'yes';
                optionalGroups.forEach(group => {
                    if (group) {
                        group.style.display = isComing ? 'block' : 'none';
                    }
                });
            });
        });

        guestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(guestForm);
            const nameInput = formData.get('guest-name');
            
            // Check 1: Ensure name is not just spaces
            if (!nameInput || nameInput.trim().length < 2) {
                alert('Пожалуйста, введите корректное имя.');
                return;
            }

            const submitBtn = guestForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            const scriptURL = 'https://script.google.com/macros/s/AKfycbxE1BHVk-0qUzfrvuN_w7OydSpXxRxaI7dz399h6xQrj3vHJGMvsomIYB2g6qhbusR5/exec';
            
            const data = new URLSearchParams();
            data.append('guest-name', nameInput.trim());
            
            // Format attendance
            const attendanceVal = formData.get('attendance');
            data.append('attendance', attendanceVal === 'yes' ? 'Придем' : 'Не сможем');
            
            if (attendanceVal === 'yes') {
                const companionsVal = formData.get('companions');
                data.append('companions', (companionsVal && companionsVal.trim() !== '') ? companionsVal.trim() : '-');
                
                // Format drinks
                const drinks = formData.getAll('drinks');
                const drinkNames = {
                    'wine': 'Вино',
                    'champagne': 'Шампанское',
                    'hard_liquor': 'Крепкий алкоголь',
                    'non_alcoholic': 'Безалкогольные'
                };
                const selectedDrinks = drinks.map(d => drinkNames[d] || d);
                data.append('drinks', selectedDrinks.length > 0 ? selectedDrinks.join(', ') : '-');
                
                // Format transfer
                const transferVal = formData.get('transfer');
                data.append('transfer', transferVal === 'yes' ? 'Нужен' : 'Не нужен');
                
                const allergiesVal = formData.get('allergies');
                data.append('allergies', (allergiesVal && allergiesVal.trim() !== '') ? allergiesVal.trim() : '-');
            } else {
                // Check 2: If not coming, clear irrelevant data
                data.append('companions', '-');
                data.append('drinks', '-');
                data.append('transfer', '-');
                data.append('allergies', '-');
            }

            fetch(scriptURL, { method: 'POST', body: data, mode: 'no-cors' })
                .then(response => {
                    guestForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    successMessage.classList.add('fade-up');
                    setTimeout(() => {
                        successMessage.classList.add('visible');
                    }, 50);
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

});
