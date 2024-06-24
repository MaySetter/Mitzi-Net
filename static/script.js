/**
 * Assignment 2
 * GitHub: https://github.com/MaySetter/Mitzi-Net
 **/

// event listener for when submit button is clicked, activate register_clicked() function
document.getElementById('registrationForm').addEventListener('submit', register_clicked);
// event listener for when delete button is clicked, activate deleteUser() function
document.getElementById('deleteButton').addEventListener('click', deleteUser);

let register_success;
/**
 * Function will check for each input element if input is valid.
 * If so, will alert that registration has been successful.
 * @param event
 */
function register_clicked(event) {
    register_success = true;
    event.preventDefault();

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let phoneNumber = document.getElementById("phoneNumber").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let passwordConfirm = document.getElementById("passwordConfirm").value;

    const name_pattern = /^[(A-Za-z)|\u0590-\u05FF\s]+$/;
    const phone_pattern = /^[0-9]{10}$/;
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const name_text = "שם לא חוקי. מותרים רק אותיות ורווחים";
    const phone_text = "מספר לא חוקי. נדרשות 10 ספרות ללא תווים";
    const email_text = "כתובית אימייל לא חוקית.";
    const password_text = "סיסמה - לפחות 8 תווים";
    const password_confirm_text = "שדה ״וידוא סיסמה״ חייב להיות זהה לשדה סיסמה";

    if (firstName !== "" && !name_pattern.test(firstName)) {
        errorProblem("firstName", name_text, "name_error");
    } else if (lastName !== "" && !name_pattern.test(lastName)) {
        errorProblem("lastName", name_text, "name_error");
    }
    if (phoneNumber !== "" && !phone_pattern.test(phoneNumber)) {
        errorProblem("phoneNumber", phone_text, "tel_error");
    }
    if (email === "" || !email_pattern.test(email)) {
        errorProblem("email", email_text, "email_error");
    }
    if (password.length < 8) {
        errorProblem("password", password_text, "password_error");
    }
    if (passwordConfirm !== password) {
        errorProblem("passwordConfirm", password_confirm_text, "confirm_error");
    }

    if (register_success) {
        sendRegistrationData(firstName, lastName, phoneNumber, email, password, passwordConfirm);
    }
}

/**
 * Function assigns register_success as false.
 * Gets a <p> element by an error id and insert error message text to element.
 * Changes the problem element's border to red. When user clicks on problem element,
 * function deletes message and turns the border back to normal.
 * @param problemId HTML element
 * @param text Error message
 * @param errorId Error id
 */
function errorProblem(problemId, text, errorId) {
    register_success = false;
    let textElement = document.getElementById(errorId);
    textElement.innerHTML = text;
    let problem = document.getElementById(problemId);
    problem.style.border = "1px solid red";
    problem.addEventListener("click", function () {
        textElement.innerHTML = "";
        problem.style.border = "";
    });
}

/**
 * fetch POST. turns all the parameters to a json object
 */
function sendRegistrationData(firstName, lastName, phoneNumber, email, password, passwordConfirm) {
    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            email: email,
            password: password,
            passwordConfirm: passwordConfirm
        })
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.error);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            location.reload(); // refresh page after
            alert("ההרשמה בוצעה בהצלחה");
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert(`Registration error: ${error.message}`);
        });
}

function deleteUser() {
    const email = document.getElementById("delete_email").value;
    const password = document.getElementById("delete_password").value;

    fetch('http://localhost:3000/clients', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.error);
                });
            }
            return response.json();
        })
        .then(data => {
            location.reload(); // refresh page after
            alert("משתמש נמחק בהצלחה");
            console.log(data);
        })
        .catch(error => {
            console.error('Error during deletion:', error);
            alert(`Deletion error: ${error.message}`);
        });
}
