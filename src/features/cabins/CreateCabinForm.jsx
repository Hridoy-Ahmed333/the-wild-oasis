// import styled from "styled-components";

import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
//import { useForm } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCabin, updateCabin } from "../../services/apiCabins";
import toast from "react-hot-toast";
import FormRow from "../../ui/FormRow";

function CreateCabinForm({ cabinToEdit = {} }) {
  //updateCabin
  const { _id: editId, ...editValues } = cabinToEdit;
  const isEditSession = Boolean(editId);
  //const { register, handleSubmit, reset, formState } = useForm();
  const { register, handleSubmit, reset, formState, control } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });
  const { errors } = formState;
  // console.log(errors);
  const queryClient = useQueryClient();
  const { mutate, isLoading: isCreated } = useMutation({
    mutationFn: (newCabin) =>
      isEditSession ? updateCabin(newCabin, editId) : addCabin(newCabin),
    onSuccess: () => {
      toast.success("new Cabin successfully created");
      queryClient.invalidateQueries({ queryKey: ["cabin"] });
      reset();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // function onSubmit(data) {
  //   mutate(data);
  // }

  function onSubmitForCreate(data) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === "image" && Array.isArray(data[key]) && data[key].length > 0) {
        formData.append("image", data[key][0], data[key][0].name);
      } else {
        formData.append(key, data[key]);
      }
    });
    mutate(formData); // Pass the FormData instance to the mutate function
  }

  // function onSubmitForUpdate(data) {
  //   const formData = new FormData();
  //   Object.keys(data).forEach((key) => {
  //     if (key === "image" && data[key] instanceof File) {
  //       // Only append the image if it is a File object
  //       formData.append("image", data[key][0], data[key][0].name);
  //     } else {
  //       // For other fields, append normally
  //       formData.append(key, data[key]);
  //     }
  //   });
  //   mutate(formData); // Pass the FormData instance to the mutate function
  // }

  function onSubmitForUpdate(data) {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (
        key === "image" &&
        data[key] &&
        data[key].length > 0 &&
        data[key][0] instanceof File
      ) {
        formData.append("image", data[key][0], data[key][0].name);
      } else {
        formData.append(key, data[key]);
      }
    });
    mutate(formData); // Pass the FormData instance to the mutate function
  }

  function onError(errors) {
    console.log(errors);
  }
  return (
    // <Form onSubmit={handleSubmit(onSubmit, onError)}>
    <Form
      onSubmit={handleSubmit(
        isEditSession ? onSubmitForUpdate : onSubmitForCreate,
        onError
      )}
    >
      <FormRow label={"Cabin Name"} error={errors?.name?.message}>
        <Input
          type="text"
          disabled={isCreated}
          id="name"
          {...register("name", { required: "This Field is required" })}
        />
      </FormRow>

      <FormRow label={"Maximum Capacity"} error={errors?.maxCapacity?.message}>
        <Input
          type="number"
          disabled={isCreated}
          id="maxCapacity"
          {...register("maxCapacity", {
            required: "This Field is required",
            min: {
              value: 1,
              message: "Capacity should be atlest one",
            },
          })}
        />
      </FormRow>

      <FormRow label={"Regular price"} error={errors?.regularPrice?.message}>
        <Input
          type="number"
          disabled={isCreated}
          id="regularPrice"
          {...register("regularPrice", {
            required: "This Field is required",
            min: {
              value: 1,
              message: "Regular Price should be more than 1",
            },
          })}
        />
      </FormRow>

      <FormRow label={"Discount"} error={errors?.discount?.message}>
        <Input
          type="number"
          disabled={isCreated}
          id="discount"
          defaultValue={0}
          {...register("discount", {
            required: "This Field is required",
            validate: (value) => {
              if (value < 0 || value > 100) {
                return "Discount should not be more than 100% and Less than 0%";
              }
            },
          })}
        />
      </FormRow>

      <FormRow
        label={"Description for website"}
        error={errors?.description?.message}
      >
        <Textarea
          type="number"
          disabled={isCreated}
          id="description"
          defaultValue=""
          {...register("description", { required: "This Field is required" })}
        />
      </FormRow>

      <FormRow label={"Cabin Photo"}>
        <Controller
          name="image"
          control={control}
          rules={{ required: isEditSession ? false : "This Field is required" }}
          render={({ field }) => (
            <FileInput
              id="image"
              disabled={isCreated}
              type="file"
              onChange={(e) => {
                if (e.target.files[0]) {
                  field.onChange([e.target.files[0]]);
                }
              }}
            />
          )}
        />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset">
          Cancel
        </Button>
        <Button disabled={isCreated}>
          {isEditSession ? "Edit Cabin" : "Creat New Cabin"}
        </Button>
      </FormRow>
    </Form>
  );
}

export default CreateCabinForm;
