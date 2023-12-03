import React from 'react';
import { Col, Button, Row, Container, Card, Form, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { db } from './firebase.js'; // Import the Firestore instance
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import logo from "../assets/ThripitakaQuestLogo.png"
import "./SignUp.css"

export default function Registration() {
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    // Use usestate show password
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Use usestate to hide password
    const toggleRePasswordVisibility = () => {
        setShowRePassword(!showRePassword);
    };

    // function for validate user enter password
    const validatePassword = (password) => {

        const passwordPolicy = "Password must include at leat one lower leter,upper letter, number & non-alphanumeric character(!@#$%&*).";

        if (password.length < 8 || password.length > 14) {
            setPasswordError(`Password must be between 8 and 14 characters long. ${passwordPolicy}`);
            return false;
        }
      
        if (!/[a-z]/.test(password)) {
          setPasswordError(passwordPolicy);
          return false;
        }
      
        if (!/[A-Z]/.test(password)) {
          setPasswordError(passwordPolicy);
          return false;
        }
      
        if (!/[0-9]/.test(password)) {
          setPasswordError(passwordPolicy);
          return false;
        }

        if (!/[^\w]/.test(password)) {
            setPasswordError(passwordPolicy);
            return false;
        }
      
        return true;
      };
    

    const handleSignUp = async () => {
        try {

            // Check if the password meets the complexity requirements
            const passwordIsValid = validatePassword(password);
            if (!passwordIsValid) {
            return;
            }

            // Check if the password and confirm password match
            if (password !== rePassword) {
            setPasswordError('Password and Confirm Password do not match');
            return;
            }

            // Create the user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // User registration successful
            const user = userCredential.user;

            // Save user data to Firestore
            const userRef = doc(db, 'users', user.uid); // Assuming 'users' is the collection

            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            };

            await setDoc(userRef, userData);

            // Navigate to the sign-in page
            navigate('/');
        } catch (error) {
            // Handle registration errors here, such as invalid email or password.
            console.error('Error registering user:', error);
        }
    };

    return (
        <div className="containerSignUp">
            <div className="center-content">
                <Card border="secondary">
                <Image src={logo} rounded className="logoPic" />
                    <Card.Body>
                        <Card.Title className="cardTitle">Create Your Account</Card.Title>

                        <Form>
                            <Form.Group controlId="firstName" className="nameGroup">
                                <Form.Control type="text" size="lg" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId="lastName" className="nameGroup">
                                <Form.Control type="text" size="lg" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId="email" className="emailGroup">
                                <Form.Control type="email" size="lg" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>

                            <Form.Group controlId="password" className="passwordGroup">
                                <div className="password-input-wrapper">
                                    <Form.Control
                                        type={showPassword ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <span className="toggle-password-button" onClick={togglePasswordVisibility}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </span>
                                </div>
                            </Form.Group>

                            <Form.Group controlId="confirmPassword" className="passwordGroup">
                                <div className="password-input-wrapper">
                                    <Form.Control
                                        size="lg"
                                        type={showRePassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={rePassword}
                                        onChange={(e)=>setRePassword(e.target.value)}
                                    />
                                    <span className="toggle-password-button" onClick={toggleRePasswordVisibility}>
                                        {showRePassword ? 'Hide' : 'Show'}
                                    </span>
                                </div>
                            </Form.Group>
                            {/* Password Error Message */}
                                {passwordError && (
                                <div className="password-error-message">
                                    <p>{passwordError}</p>
                                </div>
                                )}

                            <Button variant="light" className="signUpButton" onClick={handleSignUp}>Sign Up</Button>
                        </Form>

                        <Row>
                            <Col>
                                <p className="linkP">Already have an account? <Link to="/">Sign In</Link></p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
