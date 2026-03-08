import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { Heart, Check } from 'lucide-react';
import { getScanHistory, updateScanNote, toggleScanLike, type ScanHistoryItem } from '../../services/historyService';

const HistoryCard = ({ item }: { item: ScanHistoryItem }) => {
    const [isLiked, setIsLiked] = useState(item.isLiked);
    const [noteText, setNoteText] = useState(item.note);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [savedNote, setSavedNote] = useState(item.note);

    const toggleLike = async () => {
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        await toggleScanLike(item.id, newStatus).catch(e => console.error("Failed to update like", e));
    };

    const handleSaveNote = async () => {
        setSavedNote(noteText);
        setIsEditingNote(false);
        await updateScanNote(item.id, noteText).catch(e => console.error("Failed to update note", e));
    };

    const getStatusColor = (status: string) => {
        if (status === 'Celiac Safe') return '#A0D39B';
        if (status === 'Gluten Found') return '#FF6B6B';
        return '#F2D38B';
    };

    // Formatting timestamp
    const formatDate = (ms: number) => {
        const d = new Date(ms);
        return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                ) : (
                    <View style={styles.productImage} />
                )}
                <View style={styles.cardInfo}>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    <Text style={styles.productName} numberOfLines={1}>{item.brand} {item.productName}</Text>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={toggleLike} style={styles.likeButton}>
                    <Heart
                        color={isLiked ? "#FF6B6B" : "#8E9AAF"}
                        fill={isLiked ? "#FF6B6B" : "transparent"}
                        size={24}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.noteSection}>
                {isEditingNote ? (
                    <View style={styles.noteEditor}>
                        <TextInput
                            style={styles.noteInput}
                            placeholder="Add a note (e.g., Felt fine, tummy ache...)"
                            placeholderTextColor="#8E9AAF"
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                            autoFocus
                        />
                        <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote}>
                            <Check color="#FFF" size={16} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.savedNoteContainer}
                        onPress={() => {
                            setNoteText(savedNote);
                            setIsEditingNote(true);
                        }}
                    >
                        {savedNote ? (
                            <Text style={styles.savedNoteText}>{savedNote}</Text>
                        ) : (
                            <Text style={styles.addNoteText}>+ Add a note</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export const HistoryScreen = () => {
    const [history, setHistory] = useState<ScanHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const logs = await getScanHistory();
                setHistory(logs);
            } catch (err) {
                console.error("Failed to fetch scan history", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2A422B" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>Scan History</Text>
                <Text style={styles.subtitle}>Your recent product checks</Text>
            </View>

            {history.length === 0 ? (
                <Text style={{ textAlign: 'center', color: '#8E9AAF', marginTop: 40, fontSize: 16 }}>No saved scans yet!</Text>
            ) : (
                history.map((item) => (
                    <HistoryCard key={item.id} item={item} />
                ))
            )}

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F8F3', // Light beige background
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#2A422B',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E9AAF',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#F0EFE9',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardInfo: {
        flex: 1,
    },
    dateText: {
        fontSize: 12,
        color: '#8E9AAF',
        fontWeight: '700',
        marginBottom: 4,
    },
    productName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#2A422B',
        marginBottom: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#F9F8F3',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#2A422B',
    },
    likeButton: {
        padding: 8,
    },
    noteSection: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.03)',
        paddingTop: 12,
    },
    savedNoteContainer: {
        backgroundColor: '#F9F8F3',
        padding: 12,
        borderRadius: 12,
        minHeight: 44,
        justifyContent: 'center',
    },
    addNoteText: {
        color: '#A0D39B',
        fontWeight: '700',
        fontSize: 14,
    },
    savedNoteText: {
        color: '#4A5B4C',
        fontSize: 14,
        lineHeight: 20,
    },
    noteEditor: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F9F8F3',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A0D39B',
        padding: 2,
    },
    noteInput: {
        flex: 1,
        minHeight: 44,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#2A422B',
        fontSize: 14,
    },
    saveNoteBtn: {
        backgroundColor: '#A0D39B',
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4,
    },
});
