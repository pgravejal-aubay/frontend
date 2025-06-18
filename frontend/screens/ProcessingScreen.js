import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { checkTaskStatus, cancelTask } from '../services/uploadService';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';

const ProcessingScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const intervalRef = useRef(null);

    const [fontsLoaded] = useFonts({
        'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    const handleCancel = async () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        try {
            await cancelTask(taskId);
            Alert.alert("Cancelled", "Processing has been cancelled.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error cancelling:", error);
            Alert.alert("Error", "Unable to cancel the task.", [
                 { text: "OK", onPress: () => navigation.goBack() }
            ]);
        }
    };

    const pollStatus = async () => {
        try {
            const response = await checkTaskStatus(taskId);

            if (response.status === 'completed') {
                clearInterval(intervalRef.current);
                Alert.alert("Success", `Translation: ${response.result.translated_text}`, [
                        { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else if (response.status === 'failed' || response.status === 'cancelled') {
                clearInterval(intervalRef.current);
                 Alert.alert("Failed", "Processing could not be completed.", [
                        { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error("Status check error:", error);
            clearInterval(intervalRef.current);
             Alert.alert("Error", "Unable to contact the server to check status.", [
                        { text: "OK", onPress: () => navigation.goBack() }
                ]);
        }
    };

    useEffect(() => {
        intervalRef.current = setInterval(pollStatus, 3000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [taskId]);

    // Show a simple loader while the font is loading
    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#555" />
            </View>
        );
    }
    
    // Main render with updated styles
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                {/* Large close-circle icon */}
                <Ionicons name="close-circle" size={40} color="#cccccc" /> 
            </TouchableOpacity>

            <View style={styles.content}>
                <ActivityIndicator size="large" color="#555" style={{ marginBottom: 40 }} />
                <Text style={styles.titleText}>
                    Generating{'\n'}
                    translation...
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontFamily: 'SpaceMono-Regular',
        fontSize: 32,
        color: '#000',
        textAlign: 'center',
        lineHeight: 43.2,
    },
    cancelButton: {
        position: 'absolute',
        top: 60,
        right: 30,
    },
});

export default ProcessingScreen;
