import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";

const STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const OrderUpdateModal = ({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [initialStatus, setInitialStatus] = useState("");

  useEffect(() => {
    if (open && formData?.orderStatus) {
      setInitialStatus(formData.orderStatus);
    } else {
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const currentIndex = STATUS_FLOW.indexOf(initialStatus);

  const getAllowedStatuses = () => {
    if (initialStatus === "DELIVERED") return ["DELIVERED"];
    if (initialStatus === "CANCELLED") return ["CANCELLED"];

    const allowed = [initialStatus];

    if (currentIndex > 0) {
      allowed.push(STATUS_FLOW[currentIndex - 1]);
    }

    if (currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1) {
      allowed.push(STATUS_FLOW[currentIndex + 1]);
    }

    if (!allowed.includes("CANCELLED")) {
      allowed.push("CANCELLED");
    }

    return STATUS_FLOW.filter((s) => allowed.includes(s)).concat(
      allowed.includes("CANCELLED") ? ["CANCELLED"] : []
    );
  };

  const allowedOptions = getAllowedStatuses();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Update Order Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify fulfillment and tracking information
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-7 space-y-4 sm:space-y-5 overflow-y-auto">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
              Order Status
            </label>
            <select
              value={formData.orderStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  orderStatus: e.target.value,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500 transition"
            >
              {allowedOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Courier Name
              </label>
              <input
                value={formData.courierName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    courierName: e.target.value,
                  })
                }
                placeholder="e.g. Blue Dart / Delhivery"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
                Tracking ID
              </label>
              <input
                value={formData.trackingId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trackingId: e.target.value,
                  })
                }
                placeholder="BD8492048"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
              Tracking URL
            </label>
            <input
              value={formData.trackingUrl}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trackingUrl: e.target.value,
                })
              }
              placeholder="https://track.bluedart.com/..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.estimatedDeliveryDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDeliveryDate: e.target.value,
                })
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-xs sm:text-sm text-white font-semibold cursor-pointer active:scale-95"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderUpdateModal;