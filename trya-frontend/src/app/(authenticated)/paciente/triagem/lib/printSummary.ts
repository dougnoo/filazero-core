import type { SummaryPresentation } from "@/shared/types/chat";
import { getPriorityLabel } from "@/shared/constants/manchesterPriority";
import type React from 'react';

export async function downloadSummary(summaryPresentation: SummaryPresentation): Promise<void> {
  const { patient, symptoms, medications, activeHistory, criticalAlerts } = summaryPresentation;

  try {
    // Dynamic imports to avoid SSR issues
    const ReactPDF = await import('@react-pdf/renderer');
    const React = (await import('react')).default;
    const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;

    // Styles
    const styles = StyleSheet.create({
      page: {
        padding: 30,
        fontSize: 12,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
      },
      header: {
        marginBottom: 15,
        paddingBottom: 10,
        borderBottom: '3px solid #0a3a3a',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0a3a3a',
        marginBottom: 5,
      },
      date: {
        fontSize: 10,
        color: '#666666',
      },
      patientInfo: {
        marginBottom: 20,
        marginTop: 15,
      },
      patientRow: {
        flexDirection: 'row',
        marginBottom: 10,
      },
      label: {
        fontWeight: 'bold',
        color: '#0a3a3a',
      },
      value: {
        color: '#333333',
      },
      section: {
        marginBottom: 15,
      },
      sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0a3a3a',
        marginBottom: 5,
        paddingBottom: 3,
        borderBottom: '2px solid #e0e0e0',
      },
      sectionContent: {
        fontSize: 13,
        lineHeight: 1.5,
        color: '#444444',
        marginTop: 5,
      },
      alertContent: {
        fontSize: 13,
        lineHeight: 1.5,
        color: '#d32f2f',
        marginTop: 5,
      },
      disclaimer: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#e6f5fa',
        borderRadius: 4,
        border: '1px solid #96c8dc',
      },
      disclaimerTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0a3a3a',
        marginBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
      },
      warningIcon: {
        width: 16,
        height: 16,
        borderRadius: 2,
        backgroundColor: '#0a3a3a',
        marginRight: 6,
        justifyContent: 'center',
        alignItems: 'center',
      },
      warningIconText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
      },
      disclaimerTitleText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0a3a3a',
      },
      disclaimerText: {
        fontSize: 11,
        lineHeight: 1.4,
        color: '#282828',
      },
      footer: {
        marginTop: 25,
        paddingTop: 10,
        borderTop: '1px solid #e0e0e0',
        textAlign: 'center',
      },
      footerText: {
        fontSize: 9,
        color: '#999999',
      },
    });

    // PDF Document - creating with React.createElement to avoid JSX in .ts file
    const MyDocument = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        // Header
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, 'Resumo da Triagem'),
          React.createElement(Text, { style: styles.date }, `Gerado em: ${new Date().toLocaleString('pt-BR')}`)
        ),
        // Patient Info
        React.createElement(
          View,
          { style: styles.patientInfo },
          React.createElement(
            View,
            { style: styles.patientRow },
            React.createElement(Text, { style: styles.label }, 'Paciente: '),
            React.createElement(Text, { style: styles.value }, patient.name)
          ),
          React.createElement(
            View,
            { style: styles.patientRow },
            React.createElement(Text, { style: styles.label }, 'Prioridade: '),
            React.createElement(
              Text,
              { style: styles.value },
              `${getPriorityLabel(patient.priority)}${patient.clinicalDescription ? ` (${patient.clinicalDescription})` : ''}`
            )
          )
        ),
        // Symptoms
        symptoms && symptoms.length > 0 && React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Sintomas'),
          React.createElement(Text, { style: styles.sectionContent }, `${symptoms.join(', ')}.`)
        ),
        // Active History
        activeHistory && activeHistory.length > 0 && React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Histórico Ativo'),
          React.createElement(Text, { style: styles.sectionContent }, `${activeHistory.join(', ')}.`)
        ),
        // Medications
        medications && medications.length > 0 && React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Medicamentos em Uso'),
          React.createElement(Text, { style: styles.sectionContent }, `${medications.join(', ')}.`)
        ),
        // Critical Alerts
        criticalAlerts && criticalAlerts.length > 0 && React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Alertas Críticos'),
          React.createElement(Text, { style: styles.alertContent }, `${criticalAlerts.join(', ')}.`)
        ),
        // Disclaimer
        React.createElement(
          View,
          { style: styles.disclaimer },
          React.createElement(
            View,
            { style: styles.disclaimerTitle },
            React.createElement(
              View,
              { style: styles.warningIcon },
              React.createElement(Text, { style: styles.warningIconText }, '!')
            ),
            React.createElement(Text, { style: styles.disclaimerTitleText }, 'IMPORTANTE')
          ),
          React.createElement(
            Text,
            { style: styles.disclaimerText },
            'Esta é uma impressão diagnóstica, não um diagnóstico médico definitivo. A inteligência artificial atua como suporte à teletriagem e não substitui a avaliação de um profissional de saúde.'
          )
        ),
        // Footer
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(Text, { style: styles.footerText }, 'Este documento foi gerado automaticamente pelo sistema de triagem.')
        )
      )
    );

    // Generate and download PDF
    const blob = await pdf(MyDocument).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumo-triagem-${patient.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Tente novamente.');
  }
}

export function printSummary(summaryPresentation: SummaryPresentation): void {
  // Função mantida para compatibilidade, mas agora apenas faz download
  downloadSummary(summaryPresentation);
}
