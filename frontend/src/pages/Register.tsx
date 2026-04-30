import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useRegister, useLogin } from "../api/hooks/useAuth";
import { getApiErrorMessage } from "../lib/apiError";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const registerSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { mutateAsync: register } = useRegister();
  const { mutateAsync: login, isPending } = useLogin();

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await register(values);
      await login(values);
      navigate("/dashboard");
    } catch (e) {
      setError("root", { message: await getApiErrorMessage(e, "Registration failed. That email may already be in use.") });
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Viral<span className="text-red-500">Scout</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">Create your free account</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-6"
          noValidate
        >
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...registerField("email")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...registerField("password")}
          />

          {errors.root && (
            <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting || isPending}
            className="w-full"
            size="md"
          >
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
