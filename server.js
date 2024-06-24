/**
 * Assignment 2
 * GitHub: https://github.com/MaySetter/Mitzi-Net
 **/

const express = require('express');
const mongojs = require('mongojs');
const bcrypt = require('bcryptjs');

// our specific collection
const db = mongojs('mongodb+srv://Student:webdev2024student@cluster0.uqyflra.mongodb.net/webdev2024', ['Dima']);
const clients_coll = db.collection('mitzinet_<Dima_May>');

const app = express();
app.use(express.json());

// Serve static files from the 'static' directory
app.use(express.static('static'));

// Route to get all clients
app.get('/clients', (req, res) => {
    clients_coll.find({}, (err, clients) => {
        if (err) {
            console.error('Error fetching clients:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(clients);
    });
});

// validates form fields and inserts to collection
app.post('/register', (req, res) => {
    console.log("Registration data:", req.body);
    const { firstName, lastName, phoneNumber, email, password, passwordConfirm } = req.body;
    // validates all fields using validation function
    const valid_error = validation(req.body);
    // if valid_error isn't null, return status 400 with the text message turned to json
    if (valid_error) {
        return res.status(400).json({ error: valid_error });
    }
    // checks if email isn't already in the database
    clients_coll.findOne({ email }, (err, client) => {
        if (err) {
            console.error('Error checking existing user:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        // if client exists, returns error
        if (client) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // if client with the same email does not exist in database, hash the password
        bcrypt.hash(password, 8, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error' });
            }
            // creates new client with hashed password
            const newClient = {
                firstName,
                lastName,
                phoneNumber,
                email,
                password: hashedPassword
            };
            // inserts the new client to the database
            clients_coll.insert(newClient, (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
                res.status(201).json({ message: 'Registration successful' });
            });
        });
    });
});

// function to check the fields' validation. if there's error, will return text message.
// otherwise will return null.
function validation(doc){
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!doc.firstName || !doc.lastName || !doc.email || !doc.password || !doc.passwordConfirm) {
        return "כל השדות חייבים להיות מלאים.";
    }
    if (doc.firstName.trim().length === 0) {
        return "שם לא חוקי. מותרים רק אותיות ורווחים";
    }
    if (doc.lastName.trim().length === 0) {
        return "שם לא חוקי. מותרים רק אותיות ורווחים";
    }
    if (!email_pattern.test(doc.email)) {
        return "כתובית אימייל לא חוקית.";
    }
    if (doc.password.trim().length < 8) {
        return "סיסמה - לפחות 8 תווים";
    }
    if (doc.password !== doc.passwordConfirm) {
        return "שדה ״וידוא סיסמה״ חייב להיות זהה לשדה סיסמה";
    }
    return null;
};

// deletes
app.delete('/clients', (req, res) => {
    const { email, password } = req.body;
    // finds the first client with the same email
    clients_coll.findOne({ email:email }, (err, client) => {
        if (err) {
            return res.status(500).json({ error: 'Server error' });
        }
        // if client doesn't exist return 404 error
        if (!client) {
            return res.status(404).json({ error: 'User not found' });
        }
        // return 0 if the password is the same as the hashed password
        bcrypt.compare(password, client.password, (err, match) => {
            if (err) {
                return res.status(500).json({ error: 'Server error' });
            }
            // client with same email found, but password doesn't match
            if (!match) {
                return res.status(400).json({ error: 'Incorrect password' });
            }
            // client with same email and password - remove from database
            clients_coll.remove({ email: email }, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Server error' });
                }
                res.status(201).json({ message: 'User deleted successfully' });
            });
        });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
