import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const debounce = (func, delay) => {
    return function (...args) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      setDebounceTimeout(
        setTimeout(() => {
          func.apply(this, args);
          setDebounceTimeout(null);
        }, delay)
      );
    };
  };

  const handleSubmitDebounced = debounce(async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions while processing
    }

    setIsSubmitting(true);
    const idempotencyKey = uuidv4();

    try {
      const response = await axios.post('/resource', formData, {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });

      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, 300); // 300ms debounce delay

  return (
    <form onSubmit={handleSubmitDebounced}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

export default MyForm;