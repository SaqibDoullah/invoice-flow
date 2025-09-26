'use client';

import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase-errors';

// This component is designed to only be used in a development environment.
// It should be conditionally rendered based on `process.env.NODE_ENV`.
export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error(error); // Log the full contextual error to the console
      
      // Also display a more helpful toast message in the UI
      toast({
        variant: "destructive",
        title: "Firestore Permission Denied",
        description: `Operation ${error.context.operation} on path ${error.context.path} was denied. Check console for details.`,
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null; // This component does not render anything
}
