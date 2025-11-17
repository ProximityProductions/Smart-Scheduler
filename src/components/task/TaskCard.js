// src/components/task/TaskCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';
import { colors } from '../../styles/colors';
import { CATEGORY_ICONS } from '../../utils/constants';

const TaskCard = ({ task, onPress, onComplete, onDelete }) => {
  if (!task) {
    console.warn('TaskCard received null task');
    return null;
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.priorityHigh;
      case 'medium':
        return colors.priorityMedium;
      case 'low':
        return colors.priorityLow;
      default:
        return colors.textSecondary;
    }
  };

  const getCategoryColor = () => {
    return colors[task.category] || colors.other;
  };

  const formatTaskDate = () => {
    const dateToFormat = task.startTime || task.dueDate;
    if (!dateToFormat) return null;

    const date = new Date(dateToFormat);
    const now = new Date();

    if (date < now) {
      return {
        text: `Overdue by ${formatDistanceToNow(date)}`,
        color: colors.error,
      };
    }

    if (date.toDateString() === now.toDateString()) {
      return {
        text: `Today at ${format(date, 'h:mm a')}`,
        color: colors.warning,
      };
    }

    const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      return {
        text: `${format(date, 'EEE')} at ${format(date, 'h:mm a')}`,
        color: colors.info,
      };
    }

    return {
      text: format(date, 'MMM d, h:mm a'),
      color: colors.textSecondary,
    };
  };

  const dateInfo = formatTaskDate();
  const categoryIcon = CATEGORY_ICONS[task?.category] || 'apps-outline';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityBar, { backgroundColor: getPriorityColor() }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor()}20` }]}>
              <Ionicons name={categoryIcon} size={16} color={getCategoryColor()} />
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {task.title || 'Untitled Task'}
            </Text>
          </View>

          <View style={styles.actions}>
            {task.status === 'pending' && (
              <TouchableOpacity
                onPress={() => onComplete?.(task.id)}
                style={styles.actionButton}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          {dateInfo && (
            <View style={styles.dateContainer}>
              <Ionicons name="time-outline" size={14} color={dateInfo.color} />
              <Text style={[styles.dateText, { color: dateInfo.color }]}>
                {dateInfo.text}
              </Text>
            </View>
          )}

          {task.duration && (
            <View style={styles.durationContainer}>
              <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.durationText}>
                {task.duration < 60
                  ? `${task.duration}m`
                  : `${Math.floor(task.duration / 60)}h ${task.duration % 60}m`}
              </Text>
            </View>
          )}

          {task.isRecurring && (
            <View style={styles.recurringBadge}>
              <Ionicons name="repeat" size={12} color={colors.primary} />
              <Text style={styles.recurringText}>Recurring</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  priorityBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 44,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: 44,
    gap: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recurringText: {
    fontSize: 10,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default TaskCard;