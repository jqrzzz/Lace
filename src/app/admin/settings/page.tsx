import SettingsForm from "./SettingsForm";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-charcoal mb-1">Settings</h1>
        <p className="text-sm text-warm-gray">
          Tell Vela how cautious you want her to be. These defaults match the
          safest posture — turn down the dial as you build trust.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
