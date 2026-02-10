export default function KBLogo() {
    return (
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="#6d6e71" />
            <path d="M20 20 H80 V80 H20 Z" fill="#ffbc00" />
            <text x="50" y="95" textAnchor="middle" fill="#6d6e71" fontSize="12" fontWeight="bold">KB Kookmin Bank</text>
            {/* Simplified placeholder for Star/Text */}
            <path d="M35 35 L65 35 L50 65 Z" fill="#6d6e71" />
        </svg>
    );
}
// Note: This is a placeholder. In a real scenario, use actual SVG asset.
// For now, I will use a simple text block styled as CI if SVG is too complex to guess.
// Actually, I'll just make a text component in the Dashboard for "KB 국민은행" with the yellow square.
