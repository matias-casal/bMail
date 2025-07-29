import { EmailProvider } from './store/EmailContext';
import { Layout } from './components/Layout';

function App() {
  return (
    <EmailProvider>
      <Layout />
    </EmailProvider>
  );
}

export default App;
