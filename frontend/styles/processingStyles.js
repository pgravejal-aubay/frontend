// frontend/styles/processingStyles.js
import { StyleSheet } from 'react-native';

export const processingStyles = StyleSheet.create({
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