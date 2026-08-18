import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import WidgetLayoutEditor from './WidgetLayoutEditor';
import dashboardService from '../services/dashboardService';

vi.mock('../services/dashboardService', () => ({
  default: {
    getWidgets: vi.fn(),
    saveWidgets: vi.fn(),
  },
}));

describe('WidgetLayoutEditor', () => {
  beforeEach(() => {
    dashboardService.getWidgets.mockResolvedValue([]);
    dashboardService.saveWidgets.mockResolvedValue({});
  });

  it('toggles visibility and saves the layout', async () => {
    render(<WidgetLayoutEditor />);
    const summary = await screen.findByLabelText('Show Summary');
    fireEvent.click(summary);
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }));
    await waitFor(() => expect(dashboardService.saveWidgets).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ widgetType: 'SUMMARY', isVisible: false }),
    ])));
    expect(await screen.findByRole('status')).toHaveTextContent('Widget layout saved.');
  });

  it('reorders widgets through drag and drop', async () => {
    render(<WidgetLayoutEditor />);
    const rows = await screen.findAllByRole('checkbox');
    const widgetRows = rows.map((checkbox) => checkbox.closest('.task-row'));
    fireEvent.dragStart(widgetRows[0]);
    fireEvent.dragOver(widgetRows[1]);
    fireEvent.drop(widgetRows[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }));
    await waitFor(() => expect(dashboardService.saveWidgets).toHaveBeenCalled());
    const saved = dashboardService.saveWidgets.mock.calls.at(-1)[0];
    expect(saved[0].widgetType).toBe('TASK_STATUS');
    expect(saved[0].position.y).toBe(0);
  });
});
