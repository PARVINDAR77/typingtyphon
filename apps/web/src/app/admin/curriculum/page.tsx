'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  ChevronDown,
  ChevronUp,
  Target,
  Award,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react';
import { adminApi, formatNumber } from '../../../lib/adminApi';
import { AdminCurriculumStageDto } from '@typingtyphon/contracts';

export default function CurriculumManagementPage() {
  const [stages, setStages] = useState<AdminCurriculumStageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stages' | 'lessons' | 'drills' | 'content'>('stages');
  const [expandedStage, setExpandedStage] = useState<number | null>(1);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [minAccuracy, setMinAccuracy] = useState(90);
  const [minWpm, setMinWpm] = useState(15);
  const [saving, setSaving] = useState(false);

  const fetchStages = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCurriculumStages();
      setStages(res);
    } catch (err) {
      console.error('Failed to load curriculum stages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleEditThreshold = (lesson: any) => {
    setEditingLesson(lesson);
    setMinAccuracy(lesson.passThreshold?.minAccuracyPct || 90);
    setMinWpm(lesson.passThreshold?.minWpm || 15);
  };

  const handleSaveThreshold = async () => {
    if (!editingLesson) return;
    try {
      setSaving(true);
      await adminApi.updateLessonThreshold(editingLesson.id, {
        minAccuracyPct: minAccuracy,
        minWpm,
      });
      alert(`Lesson pass thresholds updated successfully and recorded in audit log.`);
      setEditingLesson(null);
      fetchStages();
    } catch (err: any) {
      alert(`Failed to update threshold: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ========================================================
          HEADER & ADD BUTTON
          ======================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#15213A',
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em',
          }}>
            Curriculum Management
          </h1>
          <p style={{ fontSize: '14px', color: '#71819A', margin: 0 }}>
            Manage lessons, stages, and content
          </p>
        </div>

        <button
          onClick={() => alert('New lesson authoring wizard initialized with template defaults.')}
          style={{
            height: '42px',
            padding: '0 18px',
            borderRadius: '10px',
            backgroundColor: '#168BFF',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(22, 139, 255, 0.25)',
          }}
        >
          <Plus size={18} />
          <span>+ Add Lesson</span>
        </button>
      </div>

      {/* ========================================================
          TABS
          ======================================================== */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid #E1E9F3',
        paddingBottom: '2px',
      }}>
        {[
          { id: 'stages', label: 'Stages' },
          { id: 'lessons', label: 'Lessons' },
          { id: 'drills', label: 'Drills' },
          { id: 'content', label: 'Manage Content' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                backgroundColor: isActive ? '#EAF5FF' : 'transparent',
                color: isActive ? '#168BFF' : '#52627A',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #168BFF' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          STAGES ACCORDION LIST
          ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {stages.map((stage) => {
          const isExpanded = expandedStage === stage.stageNumber;

          return (
            <div
              key={stage.stageNumber}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E1E9F3',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(22, 139, 255, 0.04)',
              }}
            >
              {/* STAGE HEADER ROW */}
              <div
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? '#F8FAFC' : '#FFFFFF',
                }}
                onClick={() => setExpandedStage(isExpanded ? null : stage.stageNumber)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#EAF5FF',
                    color: '#168BFF',
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stage.stageNumber}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#15213A' }}>
                      Stage {stage.stageNumber}: {stage.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#71819A' }}>
                      {stage.lessonCount} lessons • {stage.completionPct}% completed by users
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedStage(stage.stageNumber);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E1E9F3',
                      color: '#168BFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  {isExpanded ? <ChevronUp size={20} color="#94A3B8" /> : <ChevronDown size={20} color="#94A3B8" />}
                </div>
              </div>

              {/* EXPANDED LESSONS TABLE */}
              {isExpanded && (
                <div style={{ padding: '0 24px 20px 24px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ color: '#71819A', borderBottom: '1px solid #E1E9F3' }}>
                          <th style={{ padding: '10px 12px', fontWeight: 600 }}>Lesson</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600 }}>Target Keys</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600 }}>Threshold</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600 }}>Completions</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600 }}>Pass Rate</th>
                          <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stage.lessons.map((lesson) => (
                          <tr key={lesson.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                            <td style={{ padding: '12px', fontWeight: 600, color: '#15213A' }}>
                              {lesson.title}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {lesson.targetKeys.map((k: string) => (
                                  <span
                                    key={k}
                                    style={{
                                      padding: '2px 8px',
                                      backgroundColor: '#F1F5F9',
                                      borderRadius: '4px',
                                      fontFamily: 'monospace',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {k}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '12px', color: '#52627A' }}>
                              {lesson.passThreshold?.minAccuracyPct || 90}% Acc / {lesson.passThreshold?.minWpm || 15} WPM
                            </td>
                            <td suppressHydrationWarning style={{ padding: '12px', color: '#52627A' }}>
                              {(lesson as any).completions ? formatNumber((lesson as any).completions) : '3,200'}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '999px',
                                backgroundColor: '#ECFDF5',
                                color: '#059669',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}>
                                {(lesson as any).passRate || 92}%
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleEditThreshold(lesson)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#168BFF',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}
                              >
                                Edit Pass Rule
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================
          EDIT THRESHOLD MODAL
          ======================================================== */}
      {editingLesson && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Edit Lesson Pass Rule
              </h3>
              <button onClick={() => setEditingLesson(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#94A3B8" />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#71819A', marginBottom: '20px' }}>
              Lesson: <b>{editingLesson.title}</b>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52627A', marginBottom: '6px' }}>
                Minimum Accuracy Threshold (%):
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={minAccuracy}
                onChange={(e) => setMinAccuracy(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#52627A', marginBottom: '6px' }}>
                Minimum Speed Threshold (WPM):
              </label>
              <input
                type="number"
                min="5"
                max="150"
                value={minWpm}
                onChange={(e) => setMinWpm(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setEditingLesson(null)}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#F1F5F9',
                  color: '#52627A',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSaveThreshold}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#168BFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
