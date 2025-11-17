// src/services/firebase/authService.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

export const signUpWithEmail = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await updateProfile(user, {
      displayName: fullName
    });
    
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      fullName: fullName,
      email: email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      productivityPatterns: {
        hourlyProductivity: {},
        dailyProductivity: {}
      },
      preferences: {
        workStartTime: '09:00',
        workEndTime: '18:00',
        breakDuration: 15,
        focusSessionLength: 25
      },
      completionStats: {
        totalTasksCompleted: 0,
        averageCompletionTime: 0,
        categoryStats: {}
      }
    });
    
    return {
      success: true,
      user: user,
      message: 'Account created successfully!'
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    await setDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date().toISOString()
    }, { merge: true });
    
    return {
      success: true,
      user: user,
      message: 'Signed in successfully!'
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Signed out successfully!'
    };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error.code,
      message: 'Failed to sign out'
    };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent!'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

export const getUserData = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        userData: docSnap.data()
      };
    } else {
      return {
        success: false,
        message: 'No user data found'
      };
    }
  } catch (error) {
    console.error('Get user data error:', error);
    return {
      success: false,
      error: error.code,
      message: 'Failed to get user data'
    };
  }
};

const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No user found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};