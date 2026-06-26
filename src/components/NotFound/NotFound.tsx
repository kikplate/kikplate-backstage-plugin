export interface NotFoundProps {
  searchQuery?: string;
}

export const NotFound = ({ searchQuery }: NotFoundProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>∅</div>
      <h2 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
        {searchQuery ? 'No plates found' : 'No plates available'}
      </h2>
      {searchQuery ? (
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          Try adjusting your search for "<strong>{searchQuery}</strong>"
        </p>
      ) : (
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
          No plates are currently available from the Kikplate API.
        </p>
      )}
    </div>
  );
};
