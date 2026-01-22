'use client';

import { useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AddMedicineDialog from '@/components/AddMedicineDialog';
import MedicineDetailModal from '@/components/MedicineDetailModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function MedicineSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [viewDetailMedicine, setViewDetailMedicine] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
        alert(result.error || '검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-gray-900 mb-2">약 검색</h1>
        <p className="text-body text-neutral-gray-600">
          약물 이름을 검색하여 정보를 확인하고 복용 시간을 추천받으세요.
        </p>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="약 이름을 입력하세요 (예: 타이레놀)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" isLoading={isSearching}>
            <MagnifyingGlassIcon className="w-5 h-5" />
            검색
          </Button>
        </form>
      </Card>

      {/* Search Results */}
      {searchResults.length === 0 && !isSearching && searchQuery && (
        <Card>
          <div className="text-center py-12">
            <p className="text-body text-neutral-gray-600">
              검색 결과가 없습니다. 다른 이름으로 검색해보세요.
            </p>
          </div>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="grid gap-4">
          {searchResults.map((medicine: any) => (
            <Card key={medicine.id} hover>
              <div className="space-y-3">
                <div>
                  <CardHeader>{medicine.name}</CardHeader>
                  <p className="text-small text-neutral-gray-600 mt-1">
                    {medicine.genericName || '성분명 정보 없음'}
                  </p>
                </div>
                
                {medicine.effect && (
                  <div>
                    <p className="text-small font-semibold text-neutral-gray-700">효능</p>
                    <p className="text-small text-neutral-gray-600">{medicine.effect}</p>
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap items-center">
                  {medicine.sleepInducing !== 'NONE' && (
                    <span className="px-2 py-1 text-xs bg-warning-50 text-warning-700 rounded">
                      😴 졸음 유발
                    </span>
                  )}
                  {medicine.alertnessEffect !== 'NONE' && (
                    <span className="px-2 py-1 text-xs bg-info-50 text-info-700 rounded">
                      ⚡ 각성 효과
                    </span>
                  )}
                  {medicine.stomachIrritation && (
                    <span className="px-2 py-1 text-xs bg-danger-50 text-danger-700 rounded">
                      ⚠️ 위장 자극
                    </span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewDetailMedicine(medicine)}
                    >
                      상세 정보
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      내 약으로 추가
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewDetailMedicine && (
        <MedicineDetailModal
          medicine={viewDetailMedicine}
          onClose={() => setViewDetailMedicine(null)}
          onAddMedicine={() => {
            setViewDetailMedicine(null);
            setSelectedMedicine(viewDetailMedicine);
          }}
        />
      )}

      {selectedMedicine && (
        <AddMedicineDialog
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
          onSuccess={() => {
            // 성공 시 검색 결과에서 제거
            setSearchResults(results => results.filter(m => m.id !== selectedMedicine.id));
          }}
        />
      )}

      {!searchQuery && (
        <Card>
          <div className="text-center py-12 text-neutral-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-body">약 이름을 입력하여 검색을 시작하세요</p>
          </div>
        </Card>
      )}
    </div>
  );
}
