

export const Camera = (_props: any) => (
    <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1B3022',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px',
        fontWeight: 'bold'
    }}>
        <div style={{ marginBottom: '20px' }}>[ CAMERA VIEW ]</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>Align ingredient label here</div>
    </div>
);

export const useCameraDevice = (_type: string) => ({ id: 'mock' });
export const useCameraFormat = () => ({});
