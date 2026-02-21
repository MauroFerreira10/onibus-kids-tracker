import { GenerateWordDocument } from '../../components/manager/GenerateWordDocument';

export default function Reports() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      
      <div className="mb-8">
        <GenerateWordDocument onGenerate={() => {}} />
      </div>
    </div>
  );
} 