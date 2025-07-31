
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleIncrement = async (amount: number = 1) => {
    setIsLoading(true);
    try {
      const result = await trpc.incrementCounter.mutate({ amount });
      setCounter(result);
    } catch (error) {
      console.error('Failed to increment counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrement = async (amount: number = 1) => {
    setIsLoading(true);
    try {
      const result = await trpc.decrementCounter.mutate({ amount });
      setCounter(result);
    } catch (error) {
      console.error('Failed to decrement counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (value: number = 0) => {
    setIsLoading(true);
    try {
      const result = await trpc.resetCounter.mutate({ value });
      setCounter(result);
    } catch (error) {
      console.error('Failed to reset counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading counter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            🔢 Counter App
          </CardTitle>
          <CardDescription className="text-gray-600">
            Simple counter with increment and decrement functionality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="text-center">
            <div className="text-6xl font-bold text-indigo-600 mb-2">
              {counter.value}
            </div>
            <Badge variant="secondary" className="text-sm">
              Counter ID: {counter.id}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleDecrement(1)}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600"
            >
              ➖ -1
            </Button>
            <Button
              onClick={() => handleIncrement(1)}
              disabled={isLoading}
              variant="outline"
              size="lg"
              className="h-12 text-lg font-semibold hover:bg-green-50 hover:border-green-300 hover:text-green-600"
            >
              ➕ +1
            </Button>
          </div>

          {/* Advanced Controls */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleDecrement(5)}
              disabled={isLoading}
              variant="secondary"
              size="sm"
              className="text-sm"
            >
              -5
            </Button>
            <Button
              onClick={() => handleReset(0)}
              disabled={isLoading}
              variant="destructive"
              size="sm"
              className="text-sm"
            >
              🔄 Reset
            </Button>
            <Button
              onClick={() => handleIncrement(5)}
              disabled={isLoading}
              variant="secondary"
              size="sm"
              className="text-sm"
            >
              +5
            </Button>
          </div>

          {/* Status Info */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <div>Created: {counter.created_at.toLocaleDateString()}</div>
            <div>Last Updated: {counter.updated_at.toLocaleString()}</div>
            {isLoading && (
              <Badge variant="outline" className="mt-2">
                ⏳ Updating...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
