// frontend/components/TutorialOverlay.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Colors } from '@/constants/Colors';

const { height: screenHeight } = Dimensions.get('window');

const TutorialOverlay = ({ visible, steps, layouts, onFinish, theme = 'light' }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Animated value for brillance effect
  const shineAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shineAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(shineAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shineAnim.stopAnimation();
    }
  }, [visible, currentStepIndex]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onFinish(); // Appeler onFinish quand le tutoriel est terminé
    }
  };

  // useMemo pour éviter de recalculer à chaque rendu si les dépendances ne changent pas
  const currentStepData = useMemo(() => {
    if (!visible || steps.length === 0) return null;
    
    const step = steps[currentStepIndex];
    const layout = layouts[step.key];

    if (!layout) return null;

    const isTargetInUpperHalf = layout.y + layout.height / 2 < screenHeight / 2;
    const dialogPosition = isTargetInUpperHalf 
      ? { top: layout.y + layout.height + 20 } 
      : { bottom: screenHeight - layout.y + 20 };

    return {
      layout,
      step,
      dialogPosition,
      isLastStep: currentStepIndex === steps.length - 1,
    };
  }, [visible, currentStepIndex, steps, layouts]);

  if (!visible || !currentStepData) {
    return null;
  }

  const { layout, step, dialogPosition, isLastStep } = currentStepData;

  // Animated style for brillance
  const animatedHighlightStyle = {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
    shadowRadius: shineAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 25] }),
    borderColor: shineAnim.interpolate({ inputRange: [0, 1], outputRange: ['#fff', '#ffe066'] }),
    borderWidth: 3,
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        {/* Cercle de surbrillance animé */}
        <Animated.View
          style={[
            styles.highlight,
            {
              left: layout.x - 10,
              top: layout.y - 10,
              width: layout.width + 20,
              height: layout.height + 20,
              borderRadius: (layout.width + 20) / 2,
            },
            animatedHighlightStyle,
          ]}
        />

        {/* Boîte de dialogue explicative */}
        <View style={[styles.dialogBox, dialogPosition]}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: Colors[theme].buttonBackground }]} onPress={handleNext}>
            <Text style={styles.buttonText}>{isLastStep ? 'Terminer' : 'Suivant'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Fond sombre semi-transparent
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  dialogBox: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6750a4',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TutorialOverlay;