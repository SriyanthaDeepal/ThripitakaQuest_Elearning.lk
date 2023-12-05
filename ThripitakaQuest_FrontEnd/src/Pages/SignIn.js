import React from "react";
import { useState } from "react";
import TextInMiddle from "../Components/TextInMiddle";
import { Link, useNavigate } from "react-router-dom";
import { Card, Image, Form, Button, Row, Col, Divider } from 'react-bootstrap';
import logo from "../assets/ThripitakaQuestLogo.png"
import googleLogo from "../assets/googleLogo.png";
import appleLogo from "../assets/appleLogo.png";
import microsoftLogo from "../assets/microsoftLogo.png";
import { OAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, query, where, getDoc, setDoc, doc } from 'firebase/firestore';
import {auth, db} from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth";
import { useUserContext } from '../UserContext';
import "./SignIn.css"


export default function SignIn() {

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { updateUser } = useUserContext(); // Use the context
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Implement the sign in function using email and password
  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const uid = user.uid;
    
        // Fetch user's first name and last name from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
    
        if (userData) {
          const { email, firstName, lastName, imageUrl } = userData;

          updateUser({
            email: email,
            userID: uid,
            firstName: firstName,
            lastName: lastName,
            imageUrl: imageUrl,
          });
          console.log(imageUrl);
          // Pass user information to the chat page
          navigate('/Chat');
        } else {
          console.error('User data not found in Firestore.');
        }
      })
      .catch((error) => {
        // Handle sign-in errors here, such as incorrect email or password.
        console.error('Error signing in:', error);
    });
  };


  // Function to check if a user document exists with the specified uid
  const checkIfUserExists = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  };


  // Implement google authentication
  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // Google sign-in successful
        const user = result.user;
        // Check if a user document with the Google UID exists
        const userExists = await checkIfUserExists(user.uid);
    
        if (!userExists) {
          // User is new, create a user document in Firestore
          createUserInFirestore(user.uid, user.email);
        }

        updateUser({
          email: user.email,
          userID: user.uid,
          displayName: user.displayName,
          imageUrl: user.photoURL,
        });
    
        // You can now navigate to the chat window and pass user information
        navigate('/Chat');
      })
      .catch((error) => {
        // Handle sign-in errors here, if any
        console.error('Error signing in with Google:', error);
      });
  };
    
  // Function to create a user document in Firestore
  const createUserInFirestore = async (uid, email) => {
    try {
      const usersRef = collection(db, 'users'); // Replace 'users' with your Firestore collection name

      // Add a new document with the user's UID as the document name and store the email as a field
      await setDoc(doc(usersRef, uid), {
        email: email,
      });

    } catch (error) {
      console.error('Error creating user document in Firestore:', error);
    }
  };


  /* Implement microsoft authentication
  const handleMicrosoftSignIn = () => {
    const provider = new OAuthProvider('microsoft.com');
    
    signInWithPopup(auth, provider)
      .then((result) => {
        // Microsoft sign-in successful
        const user = result.user;
        console.log('User signed in with Microsoft:', user);
        navigate('/Chat'); // Navigate to the chat page
      })
      .catch((error) => {
        // Handle sign-in errors here, if any
        console.error('Error signing in with Microsoft:', error);
      });
    };
    */

    /* Implement apple authentication
    const handleAppleSignIn = () => {
      const provider = new OAuthProvider('apple.com');
    
      signInWithPopup(auth, provider)
        .then((result) => {
          // Apple sign-in successful
          const user = result.user;
          console.log('User signed in with Apple:', user);
          navigate('/Chat'); // Navigate to the chat page
        })
        .catch((error) => {
          // Handle sign-in errors here, if any
          console.error('Error signing in with Apple:', error);
        });
    };
    */
        
    return (
          <div className="containerSignIn">
            <div className="center-content">
              <Card border="secondary" className="cardSignIn">
                  <Image src={logo} rounded className="logoPic" />
                  <Card.Body>
                      <Card.Title className="cardTitleSignIn">Sign In to Explore <br/> Wisdom</Card.Title>
                      <Form>
                          <Form.Group controlId="email" className="emailGroupSignIn" value={email} onChange={(e) => setEmail(e.target.value)}><Form.Control size="lg" type="email" placeholder="Email" /></Form.Group>

                          <Form.Group controlId="password" className="passwordGroupSignIn" value={password} onChange={(e) => setPassword(e.target.value)}>
                            <div className="password-input-wrapper">
                                  <Form.Control
                                      size="lg"
                                      type={showPassword ? 'text' : 'password'}
                                      placeholder="Password"
                                  />
                                  <span className="toggle-password-button" onClick={togglePasswordVisibility}>
                                      {showPassword ? 'Hide' : 'Show'}
                                  </span>
                              </div>  
                          </Form.Group>
                          {/*<a className="forgotPassword" href="/PasswordReset">Forgot Password?</a>*/}
                          <Button variant="light" className="continueButton" onClick={handleSignIn}>Continue</Button>
                      </Form>

                      <div className="middleText" >
                        <TextInMiddle title="or"/>
                      </div>
                      

                      <Row><Col><p className="linkP">Don't have an account? <a href="/signup">Sign up</a></p></Col></Row>

                      <Row><Col><Button variant="light" className="authButton" onClick={handleGoogleSignIn}>
                                  <Image src={googleLogo} rounded className="authBtnImg" /> Sign in with Google</Button></Col></Row>
                      {/*
                      <Row><Col>
                              <Button variant="light" className="authButton" onClick={handleMicrosoftSignIn}>
                                  <Image src={microsoftLogo} rounded className="authBtnImg" /> Sign in with Microsoft</Button></Col></Row>

                      <Row><Col><Button variant="light" className="authButton" onClick={handleAppleSignIn}>
                                <Image src={appleLogo} rounded className="authBtnImg" /> Sign in with Apple</Button></Col></Row> */}
                  </Card.Body>
              </Card>
            </div>
          </div>
    );
}
