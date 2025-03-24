
import { FC } from 'react';
import { useParams } from 'react-router-dom';

const EditTourPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Edit Tour</h1>
      <p>Editing tour with ID: {id}</p>
    </div>
  );
};

export default EditTourPage;
