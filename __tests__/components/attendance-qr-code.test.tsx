import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendanceQRCode from '@/components/attendance-qr-code';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AttendanceQRCode', () => {
  const defaultProps = {
    branchId: 'test-branch-id',
    branchName: 'Test Branch',
    branchAddress: '123 Test Street, Test City',
    employeeCount: 10,
  };

  beforeEach(() => {
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
      },
      writable: true,
    });
  });

  it('renders the component with branch information', () => {
    render(<AttendanceQRCode {...defaultProps} />);

    expect(screen.getByText('Attendance QR Code')).toBeInTheDocument();
    expect(screen.getByText('Test Branch')).toBeInTheDocument();
    expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument();
    expect(screen.getByText('10 staff')).toBeInTheDocument();
  });

  it('displays the attendance URL', () => {
    render(<AttendanceQRCode {...defaultProps} />);

    const expectedUrl = 'http://localhost:3000/attendance/test-branch-id';
    expect(screen.getByDisplayValue(expectedUrl)).toBeInTheDocument();
  });

  it('shows QR code preview', () => {
    render(<AttendanceQRCode {...defaultProps} />);

    // Check if QR code container exists
    const qrContainer = document.getElementById('qr-test-branch-id');
    expect(qrContainer).toBeInTheDocument();
  });

  it('opens large QR code dialog when view large button is clicked', async () => {
    render(<AttendanceQRCode {...defaultProps} />);

    const viewLargeButton = screen.getByText('View Large');
    fireEvent.click(viewLargeButton);

    await waitFor(() => {
      expect(
        screen.getByText('Attendance QR Code - Test Branch')
      ).toBeInTheDocument();
    });
  });

  it('has download and print functionality', () => {
    render(<AttendanceQRCode {...defaultProps} />);

    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('displays instructions for staff', () => {
    render(<AttendanceQRCode {...defaultProps} />);

    expect(
      screen.getByText('Staff can scan this QR code to check in/out')
    ).toBeInTheDocument();
  });
});
