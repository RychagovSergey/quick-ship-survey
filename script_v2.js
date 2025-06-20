// Delivery Survey JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Star rating functionality
    const starContainer = document.getElementById('overallRating');
    const starButtons = starContainer.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('overallRatingValue');
    
    starButtons.forEach((star, index) => {
        star.addEventListener('click', function() {
            const rating = index + 1;
            ratingInput.value = rating;
            
            // Update star display
            starButtons.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                    s.style.color = '#fbbf24';
                } else {
                    s.classList.remove('active');
                    s.style.color = '#d1d5db';
                }
            });
        });
        
        // Hover effect
        star.addEventListener('mouseenter', function() {
            const rating = index + 1;
            starButtons.forEach((s, i) => {
                if (i < rating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '#d1d5db';
                }
            });
        });
    });
    
    // Reset stars on mouse leave
    starContainer.addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingInput.value) || 0;
        starButtons.forEach((s, i) => {
            if (i < currentRating) {
                s.style.color = '#fbbf24';
            } else {
                s.style.color = '#d1d5db';
            }
        });
    });
    
    // Form validation and submission
    const form = document.getElementById('deliveryForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate required fields
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Отправка...';
        form.classList.add('loading');
        
        // Prepare form data
        const formData = new FormData(form);
        
        // Submit data
        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                form.style.display = 'none';
                successMessage.classList.remove('hidden');
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(data.message || 'Произошла ошибка при отправке');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Произошла ошибка при отправке формы. Попробуйте еще раз.');
        })
        .finally(() => {
            // Reset loading state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Отправить отзыв';
            form.classList.remove('loading');
        });
    });
    
    function validateForm() {
        let isValid = true;
        const errors = [];
        
        // Check required text fields
        const requiredFields = ['firstName', 'lastName', 'email'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                isValid = false;
                errors.push(`Поле "${field.labels[0].textContent}" обязательно для заполнения`);
                field.classList.add('border-red-500');
            } else {
                field.classList.remove('border-red-500');
            }
        });
        
        // Check email format
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            isValid = false;
            errors.push('Введите корректный email адрес');
            document.getElementById('email').classList.add('border-red-500');
        }
        
        // Check overall rating
        if (!ratingInput.value) {
            isValid = false;
            errors.push('Выберите общую оценку качества обслуживания');
        }
        
        // Check ease of ordering
        const easeOfOrdering = document.querySelector('input[name="easeOfOrdering"]:checked');
        if (!easeOfOrdering) {
            isValid = false;
            errors.push('Выберите оценку легкости заказа');
        }
        
        // Note: supportFriendliness and supportResponseTime are not strictly required
        // as they have a "Не обращался" (Not contacted) option.
        // If they were mandatory, validation would be added here.

        if (!isValid) {
            alert('Пожалуйста, исправьте следующие ошибки:\n\n' + errors.join('\n'));
        }
        
        return isValid;
    }
    
    // Real-time validation
    document.getElementById('email').addEventListener('blur', function() {
        const email = this.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            this.classList.add('border-red-500');
        } else {
            this.classList.remove('border-red-500');
        }
    });
    
    // Remove error styling on input
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('border-red-500');
            }
        });
    });
    
    // Animate form sections on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Add animation to form sections
    const sections = document.querySelectorAll('.border-b');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});
