"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "signin" | "signup" | "forgot-password" | "reset-password";
  callbackUrl?: string;
}

const signinFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const forgotPasswordFormSchema = z.object({
  email: z.string().email(),
});

const resetPasswordFormSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SigninFormValues = z.infer<typeof signinFormSchema>;
type SignupFormValues = z.infer<typeof signupFormSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type FormValues = SigninFormValues | SignupFormValues | ForgotPasswordFormValues | ResetPasswordFormValues;

export function AuthForm({ className, type, callbackUrl, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const getFormSchema = () => {
    switch (type) {
      case "signin":
        return signinFormSchema;
      case "signup":
        return signupFormSchema;
      case "forgot-password":
        return forgotPasswordFormSchema;
      case "reset-password":
        return resetPasswordFormSchema;
      default:
        return signinFormSchema;
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      ...(type === "signin" && { email: "", password: "" }),
      ...(type === "signup" && { name: "", email: "", password: "" }),
      ...(type === "forgot-password" && { email: "" }),
      ...(type === "reset-password" && { password: "", confirmPassword: "" }),
    } as FormValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      switch (type) {
        case "signin": {
          const { email, password } = values as SigninFormValues;
          const result = await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: callbackUrl || "/dashboard",
          });

          if (result?.error) {
            toast.error("Invalid email or password");
          } else {
            window.location.href = "/dashboard";
          }
          break;
        }

        case "signup": {
          const signupValues = values as SignupFormValues;
          const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(signupValues),
          });

          if (!res.ok) {
            const error = await res.text();
            throw new Error(error);
          }

          toast.success("Account created successfully! Please sign in.");
          window.location.href = "/auth/signin";
          break;
        }

        case "forgot-password": {
          const { email } = values as ForgotPasswordFormValues;
          const forgotRes = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!forgotRes.ok) {
            const error = await forgotRes.text();
            throw new Error(error);
          }

          toast.success("Password reset email sent!");
          break;
        }

        case "reset-password": {
          const { password } = values as ResetPasswordFormValues;
          if (!token) {
            throw new Error("Reset token is missing");
          }

          const resetRes = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
          });

          if (!resetRes.ok) {
            const error = await resetRes.text();
            throw new Error(error);
          }

          toast.success("Password reset successfully! Please sign in.");
          window.location.href = "/auth/signin";
          break;
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {type === "signup" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          {(type === "signin" || type === "signup" || type === "forgot-password") && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(type === "signin" || type === "signup" || type === "reset-password") && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === "reset-password" && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {type === "signin" && "Sign In"}
            {type === "signup" && "Sign Up"}
            {type === "forgot-password" && "Send Reset Link"}
            {type === "reset-password" && "Reset Password"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  );
}
