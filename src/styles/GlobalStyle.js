import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Cinzel:wght@600;700&family=Playfair+Display:wght@600;700&display=swap');

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    background-color: #020617;
    color: #f8fafc;
    -webkit-font-smoothing: antialiased;
  }

  .font-brand {
    font-family: 'Cinzel', serif;
  }

  .font-luxury {
    font-family: 'Playfair Display', serif;
  }

  .glass-card {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .navy-gradient {
    background: radial-gradient(circle at top right, #1e293b, #020617);
  }

  @media (min-width: 1024px) {
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #020617;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3b82f6;
    }
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

export default GlobalStyle;
