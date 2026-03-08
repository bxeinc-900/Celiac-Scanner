import { firestore, auth } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc } from 'firebase/firestore';
import type { CeliacSafetyReport } from './ai_engine/celiacSafeReferenceEngine';

export interface ScanHistoryItem {
    id: string;
    date: number;
    productName: string;
    brand: string;
    status: string;
    imageUrl?: string;
    isLiked: boolean;
    note: string;
    report: CeliacSafetyReport;
}

export const saveScanToHistory = async (report: CeliacSafetyReport, imageUrl?: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Must be logged in to save history");

    const historyRef = collection(firestore, `users/${user.uid}/history`);

    const docRef = await addDoc(historyRef, {
        date: Timestamp.now(),
        productName: report.productName || 'Unknown Product',
        brand: report.brand || 'Unknown Brand',
        status: report.status || 'Uncertain',
        imageUrl: imageUrl || '',
        isLiked: false,
        note: '',
        report: report
    });

    return docRef.id;
};

export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
    const user = auth.currentUser;
    if (!user) return [];

    const historyRef = collection(firestore, `users/${user.uid}/history`);
    const q = query(historyRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            date: data.date?.toMillis() || Date.now(),
            productName: data.productName,
            brand: data.brand,
            status: data.status,
            imageUrl: data.imageUrl,
            isLiked: data.isLiked || false,
            note: data.note || '',
            report: data.report
        } as ScanHistoryItem;
    });
};

export const updateScanNote = async (scanId: string, note: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/history`, scanId);
    await updateDoc(docRef, { note });
};

export const toggleScanLike = async (scanId: string, isLiked: boolean) => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/history`, scanId);
    await updateDoc(docRef, { isLiked });
};
