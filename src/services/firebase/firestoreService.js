// src/services/firebase/firestoreService.js
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

if (!db) {
  console.error('Firestore is not initialized!');
}

export const createUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
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
      },
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log('Getting user profile for:', userId);
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('User profile found');
      return { success: true, data: docSnap.data() };
    } else {
      console.log('User profile not found');
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const createTask = async (userId, taskData) => {
  try {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      userId,
      status: 'pending',
      postponedCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, taskId: docRef.id };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message };
  }
};

export const getTasks = async (userId, filters = {}) => {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    console.log('Getting tasks for user:', userId);
    const tasksRef = collection(db, 'users', userId, 'tasks');
    let q = query(tasksRef);
    
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      tasks.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt,
      });
    });
    
    console.log(`Found ${tasks.length} tasks`);
    return { success: true, tasks };
  } catch (error) {
    console.error('Error getting tasks:', error);
    return { success: false, error: error.message, tasks: [] };
  }
};

export const getTask = async (userId, taskId) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    
    if (taskSnap.exists()) {
      return { 
        success: true, 
        task: { id: taskSnap.id, ...taskSnap.data() } 
      };
    } else {
      return { success: false, error: 'Task not found' };
    }
  } catch (error) {
    console.error('Error getting task:', error);
    return { success: false, error: error.message };
  }
};

export const updateTask = async (userId, taskId, updates) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTask = async (userId, taskId) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
};

export const completeTask = async (userId, taskId, actualDuration) => {
  try {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      actualDuration: actualDuration || null,
      updatedAt: serverTimestamp()
    });
    
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const currentStats = userData.completionStats || {
        totalTasksCompleted: 0
      };
      
      await updateDoc(userRef, {
        'completionStats.totalTasksCompleted': currentStats.totalTasksCompleted + 1,
        updatedAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error completing task:', error);
    return { success: false, error: error.message };
  }
};

export const createFocusSession = async (userId, sessionData) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'focusSessions');
    const docRef = await addDoc(sessionsRef, {
      ...sessionData,
      userId,
      createdAt: serverTimestamp()
    });
    
    return { success: true, sessionId: docRef.id };
  } catch (error) {
    console.error('Error creating focus session:', error);
    return { success: false, error: error.message };
  }
};

export const getFocusSessions = async (userId, limit = 10) => {
  try {
    const sessionsRef = collection(db, 'users', userId, 'focusSessions');
    const q = query(sessionsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const sessions = [];
    
    querySnapshot.forEach((docSnap) => {
      sessions.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    return { success: true, sessions: sessions.slice(0, limit) };
  } catch (error) {
    console.error('Error getting focus sessions:', error);
    return { success: false, error: error.message };
  }
};