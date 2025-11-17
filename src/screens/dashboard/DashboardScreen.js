// src/screens/dashboard/DashboardScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { signOutUser } from "../../services/firebase/authService";
import {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
} from "../../services/firebase/firestoreService";
import TaskForm from "../../components/task/TaskForm";
import TaskCard from "../../components/task/TaskCard";
import { colors } from "../../styles/colors";

const DashboardScreen = () => {
  const { user, userProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) {
      console.log("No user, skipping task load");
      return;
    }

    try {
      console.log("Loading tasks for user:", user.uid);
      const result = await getTasks(user.uid);
      if (result.success) {
        console.log("Tasks loaded successfully:", result.tasks.length);
        setTasks(result.tasks);
      } else {
        console.error("Failed to load tasks:", result.error);
        if (result.tasks) {
          setTasks(result.tasks);
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, []);

  const handleCreateTask = async (taskData) => {
    setShowTaskForm(false);

    try {
      const result = await createTask(user.uid, taskData);

      if (result.success) {
        Alert.alert("Success", "Task created successfully!");
        loadTasks();
      } else {
        Alert.alert("Error", result.error || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const result = await completeTask(user.uid, taskId);
      if (result.success) {
        loadTasks();
      } else {
        Alert.alert("Error", "Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await deleteTask(user.uid, taskId);
            if (result.success) {
              loadTasks();
            }
          } catch (error) {
            console.error("Error deleting task:", error);
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          const result = await signOutUser();
          if (!result.success) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.displayName || "User"}! 👋
          </Text>
          <Text style={styles.subtitle}>Let's organize your day</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Ionicons name="list-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={24}
                color={colors.success}
              />
            </View>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(245, 158, 11, 0.1)" },
              ]}
            >
              <Ionicons name="flame" size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {userProfile?.completionStats?.totalTasksCompleted || 0}
            </Text>
            <Text style={styles.statLabel}>Total Done</Text>
          </View>
        </View>

        {/* Add Task Button */}
        <View style={styles.addTaskSection}>
          <TouchableOpacity
            style={styles.addTaskButton}
            onPress={() => setShowTaskForm(true)}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" />
            <Text style={styles.addTaskButtonText}>Create New Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              All ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "pending" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("pending")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "pending" && styles.filterTextActive,
              ]}
            >
              Pending ({pendingCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "completed" && styles.filterTabActive,
            ]}
            onPress={() => setFilter("completed")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "completed" && styles.filterTextActive,
              ]}
            >
              Completed ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.sectionTitle}>Your Tasks</Text>
            {filteredTasks.length > 0 && (
              <Text style={styles.taskCount}>{filteredTasks.length} tasks</Text>
            )}
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="hourglass-outline"
                size={48}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyStateText}>Loading tasks...</Text>
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  filter === "completed"
                    ? "checkmark-done-circle-outline"
                    : "document-text-outline"
                }
                size={64}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyStateTitle}>
                {filter === "completed"
                  ? "No completed tasks yet"
                  : "No tasks yet"}
              </Text>
              <Text style={styles.emptyStateSubtitle}>
                {filter === "completed"
                  ? "Complete some tasks to see them here"
                  : "Tap the button above to create your first task"}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() =>
                  Alert.alert("Task Details", `Task: ${task.title}`)
                }
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Task Form Modal */}
      <TaskForm
        visible={showTaskForm}
        onSubmit={handleCreateTask}
        onCancel={() => setShowTaskForm(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  content: { flex: 1 },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  addTaskSection: { paddingHorizontal: 24, marginBottom: 24 },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  filterTextActive: { color: "#ffffff" },
  tasksSection: { paddingHorizontal: 24 },
  tasksSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: colors.textPrimary },
  taskCount: { fontSize: 14, color: colors.textSecondary },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
});

export default DashboardScreen;
